async function fetchTitleFromFandom(epNum) {
    const title = `Episode_${epNum}`;
    const url = `https://onepiece.fandom.com/api.php?action=query&titles=${title}&prop=revisions&rvprop=content&format=json&origin=*`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        
        console.log("Data keys:", Object.keys(data.query.pages));
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === "-1") return null;
        
        const content = pages[pageId].revisions[0]["*"];
        console.log("Content start:", content.substring(0, 100));
        
        const match = content.match(/\|\s*(title|judul)\s*=\s*([^|\n]+)/i);
        console.log("Match:", match);
        if (match && match[2]) {
            let result = match[2].replace(/\{\{.*?\}\}/g, '').trim();
            result = result.replace(/\s*\(.*?\)\s*/g, '').trim();
            return result;
        }
    } catch (e) {
        console.error('Fandom API Error:', e.message);
    }
    return null;
}
fetchTitleFromFandom(1157).then(console.log);
