import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../data/english_episodes.json');

async function fetchEpisodes() {
    let allEpisodes = {};
    let page = 1;
    let hasMore = true;

    console.log('Starting One Piece English Title Sync...');

    while (hasMore) {
        try {
            console.log(`Fetching page ${page}...`);
            const response = await fetch(`https://api.jikan.moe/v4/anime/21/episodes?page=${page}`);
            
            if (response.status === 429) {
                console.log('Rate limited. Waiting 2 seconds...');
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            if (!response.ok) {
                console.error(`Error: ${response.statusText}`);
                break;
            }

            const json = await response.json();
            const data = json.data;

            if (!data || data.length === 0) {
                hasMore = false;
                break;
            }

            data.forEach(ep => {
                // Use the English title if available, otherwise fallback to original title
                allEpisodes[ep.mal_id] = ep.title || ep.title_japanese;
            });

            hasMore = json.pagination.has_next_page;
            page++;

            // Small delay to be nice to the API
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            console.error('Fetch error:', error);
            hasMore = false;
        }
    }

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allEpisodes, null, 2));
    console.log(`Successfully synced ${Object.keys(allEpisodes).length} episode titles.`);
}

fetchEpisodes();
