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

async function sync() {
    console.log('🔄 Menghubungkan ke Bilibili/Bstation (SEA) API...');
    
    try {
        const resultId = await fetchBilibiliData('id_ID');
        const resultEn = await fetchBilibiliData('en_US');

        const episodesId = extractEpisodes(resultId);
        const episodesEn = extractEpisodes(resultEn);

        if (episodesId.length === 0) {
            throw new Error('Tidak ada data episode yang ditemukan dalam respon API.');
        }

        // Baca data lokal
        let currentDataId = JSON.parse(fs.readFileSync(DATA_PATH_ID, 'utf8'));
        let currentDataEn = JSON.parse(fs.readFileSync(DATA_PATH_EN, 'utf8'));

        let newCount = 0;
        episodesId.forEach((ep, index) => {
            const epNum = ep.title.trim(); 
            const epId = ep.id;
            const epEn = episodesEn.find(e => e.id === epId) || ep;
            
            // Logic perbaikan judul: Jika judul generik, coba cari yang lebih deskriptif
            const isGeneric = (t) => !t || t.toLowerCase() === `episode ${epNum}` || t === epNum;
            
            let finalTitleId = ep.long_title;
            let finalTitleEn = epEn.long_title;

            // Fallback: Jika ID generik tapi EN ada judul (atau sebaliknya), gunakan yang tersedia
            if (isGeneric(finalTitleId) && !isGeneric(finalTitleEn)) finalTitleId = finalTitleEn;
            if (isGeneric(finalTitleEn) && !isGeneric(finalTitleId)) finalTitleEn = finalTitleId;

            // Jika masih generik, coba bersihkan "Episode XXX" jika ada info tambahan
            const cleanTitle = (t) => t ? t.replace(/^Episode\s+\d+\s*[:-]?\s*/i, '').trim() : t;
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
                // Perbarui judul jika sebelumnya tersimpan sebagai judul generik
                console.log(`🔄 Memperbarui Judul: [${epNum}] ${currentDataId[epNum].title} -> ${finalTitleId}`);
                currentDataId[epNum].title = finalTitleId;
                currentDataEn[epNum] = finalTitleEn;
                newCount++;
            }
        });

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
