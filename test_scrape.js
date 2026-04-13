import fetch from 'node-fetch';

async function fetchTitleFromHTML(epNum, epId, locale) {
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
            console.log("NOT OK", response.status);
            return null;
        }
        const html = await response.text();
        
        const tags = [
            html.match(/<title>([^<]+)<\/title>/i),
            html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i),
            html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i)
        ];

        for (const match of tags) {
            if (match && match[1]) {
                const fullTitle = match[1].trim();
                console.log("Found raw tag:", fullTitle);
                
                if (!fullTitle.includes(epNum) && !fullTitle.match(new RegExp(`E${epNum}`, 'i'))) {
                    console.log("Validation failed for:", fullTitle);
                    continue;
                }

                let cleaned = fullTitle
                    .replace(/^One\s+Piece\s+(Episode|E)\d+\s*[\-\–\—\:\|]\s*/i, '')
                    .replace(/\s*[\-\–\—\:\|]\s*(Bstation|Bilibili|One Piece).*$/i, '')
                    .trim();

                const isGeneric = (t) => t.toLowerCase().includes('one piece') && (t.toLowerCase().includes('hd') || t.length < 15);
                if (cleaned && !isGeneric(cleaned) && cleaned !== fullTitle) {
                    console.log("Cleaned successfully:", cleaned);
                    return cleaned;
                } else {
                    console.log("Cleanup rejected:", cleaned);
                }
            }
        }
        console.warn(`Diagnostic: ${html.substring(0, 100)}`);
    } catch (e) {
        console.error("Error", e);
    }
}

fetchTitleFromHTML('1157', '28983438', 'id_ID');
