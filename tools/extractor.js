// ========================================
// Audio Truyen Extractor - Bookmarklet
// Chạy trong Console khi đang ở trang audiotruyenfull.com
// ========================================

(function () {
    // Extract book data
    const data = {
        title: document.querySelector('h1.entry-title')?.innerText.trim() || '',
        author: document.querySelector('a[href*="tac-gia"]')?.innerText.trim() || '',
        thumbnail: document.querySelector('.entry-content img')?.src || '',
        description: document.querySelector('.entry-content')?.innerText.substring(0, 1000) || '',
        genres: [...document.querySelectorAll('a[href*="the-loai"]')].map(a => a.innerText.trim()).filter(g => g.length > 1),
        sourceUrl: window.location.href,
        chapters: []
    };

    // Extract audio URLs from scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        const content = script.innerText;
        if (content.includes('mp3') || content.includes('playlist')) {
            const mp3Matches = content.match(/https?:\/\/[^"'\s\\]+\.mp3[^"'\s\\]*/gi);
            if (mp3Matches) {
                mp3Matches.forEach((url, index) => {
                    url = url.replace(/\\\//g, '/');
                    if (!data.chapters.find(c => c.audioUrl === url)) {
                        data.chapters.push({
                            title: `Chương ${data.chapters.length + 1}`,
                            audioUrl: url
                        });
                    }
                });
            }
        }
    });

    // Also check for megaurl links
    const megaLinks = document.querySelectorAll('a[href*="megaurl"]');
    megaLinks.forEach((link, index) => {
        try {
            const url = new URL(link.href);
            const encodedUrl = url.searchParams.get('url');
            if (encodedUrl) {
                const decoded = atob(encodedUrl);
                if (!data.chapters.find(c => c.audioUrl === decoded)) {
                    data.chapters.push({
                        title: link.innerText.trim() || `Chương ${data.chapters.length + 1}`,
                        audioUrl: decoded
                    });
                }
            }
        } catch (e) { }
    });

    // Show result
    console.log('=== EXTRACTED DATA ===');
    console.log(JSON.stringify(data, null, 2));

    // Copy to clipboard
    const jsonStr = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        alert(`✅ Đã extract và copy vào clipboard!\n\nTitle: ${data.title}\nAuthor: ${data.author}\nChapters: ${data.chapters.length}\n\nPaste vào Admin Panel để lưu.`);
    }).catch(() => {
        // Fallback - show in prompt
        prompt('Copy đoạn JSON này:', jsonStr);
    });

    return data;
})();
