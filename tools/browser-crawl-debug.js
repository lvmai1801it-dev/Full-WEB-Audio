/**
 * ============================================
 * AUDIO TRUYEN - DEBUG CRAWL SCRIPT
 * Chỉ extract data, KHÔNG upload lên server
 * ============================================
 */

(function DebugCrawl() {
    console.log('🔍 DEBUG MODE - Chỉ extract, không upload');
    console.log('📍 URL:', window.location.href);

    // ========== HELPER ==========
    const getByXPath = (xpath) => {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    };

    const findPostId = () => {
        const postElement = document.querySelector('[id^="post-"]');
        return postElement ? postElement.id : null;
    };

    const postId = findPostId();
    console.log('📌 Post ID:', postId);

    // ========== TEST CHAPTER EXTRACTION ==========
    console.log('\n===== TEST CHAPTER EXTRACTION =====');

    // Thử tìm container bằng class trực tiếp
    const audioContainer = document.querySelector('.tad-field-content-audio');
    console.log('1. Container .tad-field-content-audio:', audioContainer ? '✅ Found' : '❌ Not found');

    if (audioContainer) {
        const items = audioContainer.querySelectorAll('.tad-field-content-items');
        console.log('2. Số lượng .tad-field-content-items:', items.length);

        if (items.length > 0) {
            console.log('\n📋 Chi tiết từng tập:');
            items.forEach((item, i) => {
                const audioEl = item.querySelector('b.paly-audio-list');
                const titleEl = item.querySelector('#single-audio-title');

                console.log(`\n   Tập ${i + 1}:`);
                console.log(`      Title: ${titleEl?.textContent?.trim() || 'N/A'}`);
                console.log(`      Audio URL: ${audioEl?.id || 'N/A'}`);
            });
        }
    }

    // Test XPath
    console.log('\n===== TEST XPATH =====');
    const xpathTest = `//*[@id="${postId}"]/div[2]/div[2]/div[3]/div[5]/div[2]/div[2]`;
    const xpathResult = getByXPath(xpathTest);
    console.log('XPath result:', xpathResult ? '✅ Found' : '❌ Not found');
    if (xpathResult) {
        console.log('XPath innerHTML preview:', xpathResult.innerHTML?.substring(0, 200) + '...');
    }

    // ========== FULL DATA EXTRACT ==========
    console.log('\n===== FULL DATA EXTRACT =====');

    const data = {
        title: '',
        author: '',
        genres: [],
        type: '',
        status: '',
        totalChapters: 0,
        description: '',
        thumbnailUrl: '',
        chapters: [],
    };

    // Title
    const titleXPath = `//*[@id="${postId}"]/header/h1`;
    const titleEl = getByXPath(titleXPath);
    data.title = titleEl?.textContent?.trim() || '';
    console.log('Title:', data.title || '❌');

    // Info
    const infoXPath = `//*[@id="${postId}"]/div[2]/div[1]`;
    const infoEl = getByXPath(infoXPath);
    if (infoEl) {
        const infoText = infoEl.innerText || '';
        const lines = infoText.split('\n').map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            if (line.includes('Tác giả:')) data.author = line.replace('Tác giả:', '').trim();
            else if (line.includes('Thể loại:')) data.genres = line.replace('Thể loại:', '').split(',').map(g => g.trim());
            else if (line.includes('Loại:')) data.type = line.replace('Loại:', '').trim();
            else if (line.includes('Trạng thái:')) data.status = line.replace('Trạng thái:', '').trim();
            else if (line.includes('Số tập:')) {
                const match = line.match(/\d+/);
                if (match) data.totalChapters = parseInt(match[0]);
            }
        }
    }

    console.log('Author:', data.author || '❌');
    console.log('Genres:', data.genres.join(', ') || '❌');
    console.log('Type:', data.type || '❌');
    console.log('Status:', data.status || '❌');
    console.log('Total Chapters:', data.totalChapters);

    // Thumbnail
    const thumbEl = document.querySelector('.entry-content img, .post-thumbnail img, article img');
    data.thumbnailUrl = thumbEl?.src || '';
    console.log('Thumbnail:', data.thumbnailUrl ? '✅' : '❌');

    // Chapters - sử dụng class selector thay vì XPath
    if (audioContainer) {
        const items = audioContainer.querySelectorAll('.tad-field-content-items');
        data.chapters = Array.from(items).map((item, index) => {
            const audioEl = item.querySelector('b.paly-audio-list');
            const titleEl = item.querySelector('#single-audio-title');
            return {
                title: titleEl?.textContent?.trim() || `Tập ${index + 1}`,
                audioUrl: audioEl?.id || '',
                index: index + 1,
            };
        });
    }

    console.log('\n🎵 Chapters Found:', data.chapters.length);
    if (data.chapters.length > 0) {
        console.log('First 3 chapters:');
        data.chapters.slice(0, 3).forEach(ch => {
            console.log(`   ${ch.index}. ${ch.title}`);
            console.log(`      → ${ch.audioUrl}`);
        });
    }

    console.log('\n✅ DEBUG COMPLETE');
    console.log('📦 Full data object:', data);

    return data;
})();
