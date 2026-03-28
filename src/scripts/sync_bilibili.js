import fs from 'fs';
import path from 'path';

const SEASON_ID = '37976';
const DATA_PATH = path.resolve('src/data/bilibili_episodes.json');

async function sync() {
    console.log('🔄 Menghubungkan ke Bilibili TV (SEA) untuk Sinkronisasi Episode...');
    
    // Kita gunakan API v2/ogv/view/season?season_id=... yang lebih lengkap datanya
    const url = `https://api.bilibili.tv/intl/gateway/v2/ogv/view/season?season_id=${SEASON_ID}&language=id_ID`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.bilibili.tv/',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Bilibili API returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cari daftar episode dalam struktur modul Bilibili SEA V2
        let episodes = [];
        if (data.data && data.data.modules) {
            const epModule = data.data.modules.find(m => m.module_type === 'episode' || (m.data && m.data.episodes));
            if (epModule && epModule.data && epModule.data.episodes) {
                episodes = epModule.data.episodes;
            }
        }

        if (episodes.length === 0) {
            console.error('⚠️ Tidak dapat menemukan daftar episode dalam respon API. Mencoba fallback script...');
            // Fallback: Jika API modul gagal, coba API pages
            const pagesUrl = `https://api.bilibili.tv/intl/gateway/v2/ogv/view/pages?season_id=${SEASON_ID}&language=id_ID`;
            const pagesRes = await fetch(pagesUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const pagesData = await pagesRes.json();
            if (pagesData.data && pagesData.data.episodes) {
                episodes = pagesData.data.episodes;
            }
        }

        if (episodes.length === 0) {
            throw new Error('Gagal mendapatkan daftar episode dari semua API endpoint.');
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
