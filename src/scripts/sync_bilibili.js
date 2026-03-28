import fs from 'fs';
import path from 'path';

const SEASON_ID = '37976';
const DATA_PATH = path.resolve('src/data/bilibili_episodes.json');

async function sync() {
    console.log('🔄 Menghubungkan ke Bilibili/Bstation (SEA) API...');
    
    // Gunakan host biliintl.com yang lebih stabil untuk versi internasional
    const url = `https://api.biliintl.com/intl/gateway/v2/ogv/view/app/season?season_id=${SEASON_ID}&language=id_ID&s_locale=id_ID`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Referer': 'https://www.bilibili.tv/',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Bilibili API returned status ${response.status}`);
        }
        
        const data = await response.json();
        const result = data.result || data.data;

        if (!result) {
            throw new Error('Gagal mendapatkan data result dari API.');
        }

        // Ambil daftar episode dari modul atau direct list
        let episodes = [];
        
        // Cek modules (struktur V2)
        if (result.modules) {
            const epModule = result.modules.find(m => m.module_type === 'episode' || (m.data && m.data.episodes));
            if (epModule && epModule.data && epModule.data.episodes) {
                episodes = epModule.data.episodes;
            }
        }

        // Fallback: Jika episode list terbatas (untuk guest), gunakan data 'new_ep'
        if (episodes.length === 0 && result.new_ep) {
            console.log(`ℹ️ Menggunakan data episode terbaru: ${result.new_ep.title}`);
            episodes = [{
                id: result.new_ep.id,
                title: result.new_ep.title,
                long_title: result.new_ep.long_title || `Episode ${result.new_ep.title}`
            }];
        }

        if (episodes.length === 0) {
            throw new Error('Tidak ada data episode yang ditemukan dalam respon API.');
        }

        // Baca data lokal
        let currentData = {};
        if (fs.existsSync(DATA_PATH)) {
            currentData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        }

        let newCount = 0;
        episodes.forEach(ep => {
            const epNum = ep.title.trim(); 
            const epId = ep.id;
            
            // Key harus numeric untuk konsistensi database kita
            if (epNum && !currentData[epNum]) {
                currentData[epNum] = {
                    title: ep.long_title || `Episode ${epNum}`,
                    url: `https://www.bilibili.tv/play/${SEASON_ID}/${epId}`
                };
                newCount++;
                console.log(`✅ Episode Baru: [${epNum}] ${currentData[epNum].title}`);
            }
        });

        if (newCount > 0) {
            // Sort database berdasarkan nomor episode
            const sortedData = {};
            Object.keys(currentData)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .forEach(key => {
                    sortedData[key] = currentData[key];
                });
            
            fs.writeFileSync(DATA_PATH, JSON.stringify(sortedData, null, 2));
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
