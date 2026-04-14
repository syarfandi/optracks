import fs from 'fs';
import path from 'path';

const SEASON_ID = '37976';
const DATA_PATH_ID = path.resolve('public/data/bilibili_episodes.json');
const DATA_PATH_EN = path.resolve('public/data/english_episodes.json');

async function fetchBilibiliData(locale) {
    const url = `https://api.biliintl.com/intl/gateway/v2/ogv/view/app/season?season_id=${SEASON_ID}&language=${locale}&s_locale=${locale}&mobi_app=android&platform=android`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://www.bilibili.tv/',
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Bilibili API (${locale}) returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data.result || data.data;
}

function extractEpisodes(result) {
    let episodes = [];
    if (result.modules) {
        const epModule = result.modules.find(m => m.module_type === 'episode' || (m.data && m.data.episodes));
        if (epModule && epModule.data && epModule.data.episodes) {
            episodes = epModule.data.episodes;
        }
    }
    if (episodes.length === 0 && result.new_ep) {
        episodes = [{
            id: result.new_ep.id,
            title: result.new_ep.title,
            long_title: result.new_ep.long_title || `Episode ${result.new_ep.title}`
        }];
    }
    return episodes;
}

async function fetchTitleFromHTML(epNum, epId, locale) {
    const lang = locale.split('_')[0];
    const url = `https://www.bilibili.tv/${lang}/play/37976/${epId}`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': lang === 'id' ? 'id-ID,id;q=0.9' : 'en-US,en;q=0.9',
                'Referer': 'https://www.bilibili.tv/'
            }
        });

        if (!response.ok) return null;
        const html = await response.text();

        // Level 1: Meta Tags (Fastest)
        const tags = [
            html.match(/<title>([^<]+)<\/title>/i),
            html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
        ];

        for (const match of tags) {
            if (match && match[1]) {
                const fullTitle = match[1].trim();
                if (fullTitle.includes(epNum)) {
                    let cleaned = fullTitle
                        .replace(/^One\s+Piece\s+(Episode|E)\d+\s*[\-\–\—\:\|]\s*/i, '')
                        .replace(/\s*[\-\–\—\:\|]\s*(Bstation|Bilibili|One Piece).*$/i, '')
                        .trim();
                    if (cleaned && cleaned.length > 5 && !cleaned.toLowerCase().includes('one piece')) return cleaned;
                }
            }
        }

        // Level 2: Parse __NEXT_DATA__ (Direct JSON state - works even if page content is hidden)
        const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"\s+type="application\/json">([^<]+)<\/script>/);
        if (nextDataMatch) {
            try {
                const nextData = JSON.parse(nextDataMatch[1]);
                // Path to title in Bstation NEXT_DATA
                const videoInfo = nextData.props?.pageProps?.videoInfo;
                if (videoInfo && videoInfo.title && (videoInfo.title.includes(epNum) || videoInfo.title.length > 10)) {
                    let title = videoInfo.title;
                    // Usually format is "E1157 - Title"
                    return title.replace(/^(E|Episode)\s*\d+\s*[\-\–\—]\s*/i, '').trim();
                }
            } catch (jsonErr) {
                // Silently fail JSON parse
            }
        }
    } catch (e) {
        console.error(`Error scraping HTML title for ${epId}:`, e.message);
    }
    return null;
}

/**
 * Fetch Official English Title from MyAnimeList (via Jikan API)
 * High reliability, no region-locking.
 */
async function fetchTitleFromJikan(epNum) {
    console.log(`🌐 Mengambil judul resmi dari MyAnimeList (Jikan) untuk Episode ${epNum}...`);
    // One Piece ID on MAL is 21. Querying the episodes endpoint.
    // Since it's paginated, we search for the specific episode number.
    const page = Math.ceil(epNum / 100); 
    const url = `https://api.jikan.moe/v4/anime/21/episodes?page=${page}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        // Look for the episode in the data array
        const ep = data.data.find(e => e.mal_id == epNum);
        if (ep && ep.title) {
            return ep.title.trim();
        }
        
        // If not found, try the NEXT page just in case of overlaps or 50-item pages
        const nextUrl = `https://api.jikan.moe/v4/anime/21/episodes?page=${page + 1}`;
        const nextResponse = await fetch(nextUrl);
        if (nextResponse.ok) {
            const nextData = await nextResponse.json();
            const nextEp = nextData.data.find(e => e.mal_id == epNum);
            if (nextEp && nextEp.title) return nextEp.title.trim();
        }
    } catch (e) {
        console.error('Jikan API Error:', e.message);
    }
    return null;
}

function sanitizeTitle(title) {
    if (!title) return null;
    // Reject titles with Chinese/Japanese characters (Kanji/Hanzi/Hiragana/Katakana)
    // to prevent fan reaction videos or mainland duplicates from polluting the data.
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(title)) {
        return null;
    }
    return title.trim();
}

/**
 * Ultimate Fallback: Query One Piece Fandom Wiki (Supports both ID and EN)
 */
async function fetchTitleFromFandom(epNum, locale = 'en_US') {
    const isId = locale === 'id_ID';
    const domain = isId ? 'onepiece.fandom.com/id' : 'onepiece.fandom.com';
    const langLog = isId ? 'ID' : 'EN';
    console.log(`🌐 Memanggil Fandom Wiki API (${langLog}) untuk Episode ${epNum}...`);
    
    // Format title as 'Episode 1157'
    const title = `Episode_${epNum}`;
    const url = `https://${domain}/api.php?action=query&titles=${title}&prop=revisions&rvprop=content&format=json&origin=*`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === "-1") return null;
        
        const content = pages[pageId].revisions[0]["*"];
        // Extract title from Infobox (handles Translation=, crunchyTitle=, title=, judul=)
        const match = content.match(/\|\s*(Translation|crunchyTitle|title|judul)\s*=\s*([^|\n]+)/i);
        if (match && match[2]) {
            let result = match[2].replace(/\{\{.*?\}\}/g, '').trim();
            // Remove any trailing commentary like " (episode)"
            result = result.replace(/\s*\(.*?\)\s*/g, '').trim();
            return result;
        }
    } catch (e) {
        console.error('Fandom API Error:', e.message);
    }
    return null;
}

async function fetchTitleFromAniList(epNum) {
    console.log(`🌐 Memanggil AniList API untuk Episode ${epNum}...`);
    const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        streamingEpisodes {
          title
        }
      }
    }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables: { id: 21 } }) // 21 is One Piece
        });
        
        if (!response.ok) return null;
        
        const result = await response.json();
        const episodes = result.data.Media.streamingEpisodes;
        
        // AniList titles often look like "Episode 1157 - Title Name"
        // We look for both "Episode X" and "Episode 0X" etc.
        const target = episodes.find(e => e.title.includes(`Episode ${epNum}`) || e.title.includes(` ${epNum} `));
        if (target) {
            // Remove "Episode X - " prefix
            return target.title.replace(/^Episode\s+\d+\s*[-\–\—]\s*/i, '').trim();
        }
    } catch (e) {
        console.error('AniList API Error:', e.message);
    }
    return null;
}

async function fetchTitleFromSearch(epNum, locale) {
    const url = `https://api.biliintl.com/intl/gateway/v2/app/search/v2?keyword=One%20Piece%20Episode%20${epNum}&language=${locale}&s_locale=${locale}&mobi_app=android&platform=android&pn=1&ps=10`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
            }
        });

        // Pastikan respon adalah JSON sebelum melakukan parsing
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
            return null; // Silent fallback jika bukan JSON (biasanya 404/region-lock)
        }

        const data = await response.json();
        
        if (data.result && data.result.items) {
            // Find episode in search results
            const item = data.result.items.find(i => 
                i.title.includes(`Episode ${epNum}`) || 
                i.title.includes(epNum) ||
                (i.ep_title && i.ep_title.includes(epNum))
            );
            
            if (item) {
                return item.long_title || item.ep_title || item.title;
            }
        }
    } catch (e) {
        console.error(`Error searching title for ${epNum}:`, e);
    }
    return null;
}

async function sync() {
    console.log('🔄 Menghubungkan ke Bilibili/Bstation (SEA) API...');
    
    try {
        const resultId = await fetchBilibiliData('id_ID');
        const resultEn = await fetchBilibiliData('en_US');
        
        if (!resultId.result && !resultId.data) {
            console.error('Cant find result in API response:', resultId);
        }

        const episodesId = extractEpisodes(resultId || {});
        const episodesEn = extractEpisodes(resultEn || {});

        const currentDataId = JSON.parse(fs.readFileSync(DATA_PATH_ID, 'utf8'));
        const currentDataEn = JSON.parse(fs.readFileSync(DATA_PATH_EN, 'utf8'));

        let newCount = 0;
        for (const ep of episodesId) {
            const epNum = ep.title.trim(); 
            const epId = ep.id;
            const epEn = episodesEn.find(e => e.id === epId) || ep;
            
            const isGeneric = (t) => !t || t.toLowerCase() === `episode ${epNum}` || t === epNum;
            
            let finalTitleId = '';
            let finalTitleEn = '';
            const apiTitleId = ep.long_title;
            const apiTitleEn = epEn.long_title;


            // --- PEMULIHAN JUDUL (INDONESIA) ---
            if (isGeneric(finalTitleId)) {
                console.log(`🇮🇩 EP ${epNum}: Memulai pemulihan judul bahasa Indonesia...`);
                
                // Langkah 1: Fandom Wiki Indonesia (Prioritas Utama)
                console.log(`🇮🇩 EP ${epNum} [ID] Langkah 1: Melalui Fandom Wiki ID...`);
                const fandomTitleId = await fetchTitleFromFandom(epNum, 'id_ID');
                if (fandomTitleId && !isGeneric(fandomTitleId)) {
                     finalTitleId = sanitizeTitle(fandomTitleId);
                }

                // Langkah 2: Scraping (NEXT_DATA)
                if (isGeneric(finalTitleId)) {
                    console.log(`🇮🇩 EP ${epNum} [ID] Langkah 2: Scraping Web Bstation...`);
                    const htmlTitle = await fetchTitleFromHTML(epNum, epId, 'id_ID');
                    if (htmlTitle) finalTitleId = sanitizeTitle(htmlTitle);
                }

                // Langkah 3: Search API
                if (isGeneric(finalTitleId)) {
                    console.log(`🇮🇩 EP ${epNum} [ID] Langkah 3: Melalui Search API...`);
                    const searchTitle = await fetchTitleFromSearch(epNum, 'id_ID');
                    if (searchTitle) finalTitleId = sanitizeTitle(searchTitle);
                }

                // Langkah 4: Bstation Main API (Opsi Terakhir)
                if (isGeneric(finalTitleId) && apiTitleId) {
                    if (!isGeneric(apiTitleId)) finalTitleId = sanitizeTitle(apiTitleId);
                }
            }




            // --- PEMULIHAN JUDUL (INGGRIS) ---
            if (isGeneric(finalTitleEn)) {
                console.log(`🇬🇧 EP ${epNum}: Memulai pemulihan judul bahasa Inggris...`);

                // Langkah 1: Scraping (NEXT_DATA)
                console.log(`🇬🇧 EP ${epNum} [EN] Langkah 1: Scraping Web Bstation...`);
                const htmlTitleEn = await fetchTitleFromHTML(epNum, epId, 'en_US');
                if (htmlTitleEn) finalTitleEn = sanitizeTitle(htmlTitleEn);

                // Langkah 2: MyAnimeList (Jikan)
                if (isGeneric(finalTitleEn)) {
                    console.log(`🇬🇧 EP ${epNum} [EN] Langkah 2: Mencari di MyAnimeList (Jikan)...`);
                    const jikanTitleEn = await fetchTitleFromJikan(epNum);
                    if (jikanTitleEn) finalTitleEn = sanitizeTitle(jikanTitleEn);
                }

                // Langkah 3: Search API
                if (isGeneric(finalTitleEn)) {
                    console.log(`🇬🇧 EP ${epNum} [EN] Langkah 3: Melalui Search API...`);
                    const searchTitleEn = await fetchTitleFromSearch(epNum, 'en_US');
                    if (searchTitleEn) finalTitleEn = sanitizeTitle(searchTitleEn);
                }

                // Langkah 4: AniList
                if (isGeneric(finalTitleEn)) {
                    console.log(`🇬🇧 EP ${epNum} [EN] Langkah 4: Melalui AniList API...`);
                    const aniTitleEn = await fetchTitleFromAniList(epNum);
                    if (aniTitleEn) finalTitleEn = sanitizeTitle(aniTitleEn);
                }

                // Langkah 5: Fandom Wiki (Ultimate Fallback)
                if (isGeneric(finalTitleEn)) {
                    const fandomTitle = await fetchTitleFromFandom(epNum, 'en_US');
                    if (fandomTitle) finalTitleEn = sanitizeTitle(fandomTitle);
                }

                // Langkah 6: Bstation Main API (Opsi Terakhir)
                if (isGeneric(finalTitleEn) && apiTitleEn) {
                    if (!isGeneric(apiTitleEn)) finalTitleEn = sanitizeTitle(apiTitleEn);
                }
            }



            // --- LOGIKA FALLBACK ANTAR BAHASA ---
            // Hapus translasi kaku campuran bahasa


            if (isGeneric(finalTitleId)) finalTitleId = `Episode ${epNum}`;
            if (isGeneric(finalTitleEn)) finalTitleEn = `Episode ${epNum}`;

            if (epNum && !currentDataId[epNum]) {
                currentDataId[epNum] = {
                    title: finalTitleId,
                    url: `https://www.bilibili.tv/play/${SEASON_ID}/${epId}`
                };
                currentDataEn[epNum] = finalTitleEn;
                
                newCount++;
                console.log(`✅ Episode Baru: [${epNum}]`);
                console.log(`   🇮🇩 ID: ${currentDataId[epNum].title}`);
                console.log(`   🇬🇧 EN: ${currentDataEn[epNum]}`);
            } else if (epNum && currentDataId[epNum]) {
                const oldTitleId = currentDataId[epNum].title;
                const oldTitleEn = currentDataEn[epNum];
                
                let updated = false;
                // PERSISTENCE LOGIC: Only update if the new title is NOT generic
                // AND it's different from the old title.
                if (isGeneric(oldTitleId) && !isGeneric(finalTitleId)) {
                    console.log(`🔄 Memperbarui Judul ID: [${epNum}] ${oldTitleId} -> ${finalTitleId}`);
                    currentDataId[epNum].title = finalTitleId;
                    updated = true;
                }
                
                if (isGeneric(oldTitleEn) && !isGeneric(finalTitleEn)) {
                    console.log(`🔄 Memperbarui Judul EN: [${epNum}] ${oldTitleEn} -> ${finalTitleEn}`);
                    currentDataEn[epNum] = finalTitleEn;
                    updated = true;
                }

                if (updated) newCount++;
            }

        }

        if (newCount > 0) {
            const sortEps = (data) => {
                const sorted = {};
                Object.keys(data)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .forEach(key => { sorted[key] = data[key]; });
                return sorted;
            };

            fs.writeFileSync(DATA_PATH_ID, JSON.stringify(sortEps(currentDataId), null, 2));
            fs.writeFileSync(DATA_PATH_EN, JSON.stringify(sortEps(currentDataEn), null, 2));
            console.log(`🚀 Selesai! Menambahkan ${newCount} episode baru ke Logbook.`);
        } else {
            console.log('✅ Logbook sudah sinkron dengan Bilibili. Tidak ada episode baru.');
        }

    } catch (error) {
        console.error('❌ Error Sinkronisasi:', error.message);
        process.exit(1);
    }
}

sync();
