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

async function fetchTitleFromHTML(epId, locale) {
    const lang = locale.split('_')[0];
    const url = `https://www.bilibili.tv/${lang}/play/37976/${epId}`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': lang === 'id' ? 'id-ID,id;q=0.9' : 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            console.warn(`⚠️ Scraping failed for ${epId}: HTTP ${response.status}`);
            return null;
        }

        const html = await response.text();
        
        // Try multiple tags: og:title, twitter:title, and standard <title>
        const tags = [
            html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i),
            html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i),
            html.match(/<title>([^<]+)<\/title>/i)
        ];

        for (const match of tags) {
            if (match && match[1]) {
                const fullTitle = match[1].trim();
                
                // Cleanup: Handle "One Piece E1157 - Name - Bstation", "Name | One Piece | Bstation", etc.
                // Regex handles various dash types (hyphen, en-dash, em-dash) and separators
                let cleaned = fullTitle
                    .replace(/^One\s+Piece\s+(Episode|E)\d+\s*[\-\–\—\:\|]\s*/i, '') // Remove prefix
                    .replace(/\s*[\-\–\—\:\|]\s*(Bstation|Bilibili|One Piece).*$/i, '') // Remove suffix
                    .trim();

                if (cleaned && cleaned.toLowerCase() !== 'one piece' && cleaned !== fullTitle) {
                    return cleaned;
                }
            }
        }

        // Diagnostic: If we found a title but couldn't clean it, or didn't find one at all
        console.warn(`🔍 Scraper diagnostic for ${epId}: Tag list empty or cleanup failed.`);
        if (html.includes('Cloudflare') || html.includes('captcha')) {
            console.warn('🚨 Dideteksi blokir Bot/Cloudflare pada runner!');
        }

    } catch (e) {
        console.error(`Error scraping HTML title for ${epId}:`, e.message);
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
            
            let finalTitleId = ep.long_title;
            let finalTitleEn = epEn.long_title;

            // Fallback 1: Search API if generic
            if (isGeneric(finalTitleId)) {
                console.log(`🔍 Mencari judul asli untuk Episode ${epNum} via Search API...`);
                const searchTitle = await fetchTitleFromSearch(epNum, 'id_ID');
                if (searchTitle) finalTitleId = searchTitle;
            }

            // Fallback 2: HTML Scraping if still generic
            if (isGeneric(finalTitleId)) {
                console.log(`🌐 Scraping judul asli untuk Episode ${epNum} dari Web Bstation...`);
                const htmlTitle = await fetchTitleFromHTML(epId, 'id_ID');
                if (htmlTitle) finalTitleId = htmlTitle;
            }

            if (isGeneric(finalTitleEn)) {
                const searchTitleEn = await fetchTitleFromSearch(epNum, 'en_US');
                if (searchTitleEn) finalTitleEn = searchTitleEn;
            }
            
            if (isGeneric(finalTitleEn)) {
                const htmlTitleEn = await fetchTitleFromHTML(epId, 'en_US');
                if (htmlTitleEn) finalTitleEn = htmlTitleEn;
            }

            // Fallback 2: Cross-language
            if (isGeneric(finalTitleId) && !isGeneric(finalTitleEn)) finalTitleId = finalTitleEn;
            if (isGeneric(finalTitleEn) && !isGeneric(finalTitleId)) finalTitleEn = finalTitleId;

            if (isGeneric(finalTitleId)) finalTitleId = `Episode ${epNum}`;
            if (isGeneric(finalTitleEn)) finalTitleEn = `Episode ${epNum}`;

            if (epNum && !currentDataId[epNum]) {
                currentDataId[epNum] = {
                    title: finalTitleId,
                    url: `https://www.bilibili.tv/play/${SEASON_ID}/${epId}`
                };
                currentDataEn[epNum] = finalTitleEn;
                
                newCount++;
                console.log(`✅ Episode Baru: [${epNum}] ${currentDataId[epNum].title}`);
            } else if (epNum && currentDataId[epNum] && isGeneric(currentDataId[epNum].title) && !isGeneric(finalTitleId)) {
                console.log(`🔄 Memperbarui Judul: [${epNum}] ${currentDataId[epNum].title} -> ${finalTitleId}`);
                currentDataId[epNum].title = finalTitleId;
                currentDataEn[epNum] = finalTitleEn;
                newCount++;
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
