/**
 * ============================================
 * AUDIO TRUYEN - BROWSER CRAWL SCRIPT
 * Customized for truyenaudiocv.org
 * ============================================
 * 
 * HƯỚNG DẪN:
 * 1. Mở tab mới → vào http://localhost:3000/admin → Login
 * 2. Mở Console (F12) → chạy: console.log(localStorage.getItem('admin_token'))
 * 3. Copy token
 * 4. Mở trang truyện cần crawl
 * 5. Paste script này, THAY TOKEN bên dưới
 * 6. Chạy script
 */

(async function CrawlAndImport() {
    // ========== CẤU HÌNH - THAY TOKEN VÀO ĐÂY ==========
    const CONFIG = {
        API_URL: 'http://localhost:3000/api/admin/books',
        TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2ODg0NzE3NH0.e0yN8gHISBjvK0Lwrd8CEE05c2BIo8L84F9aDmpgjbQ',
    };

    console.log('🚀 Bắt đầu crawl...');
    console.log('📍 URL:', window.location.href);

    // ========== HELPER FUNCTIONS ==========
    const getByXPath = (xpath) => {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    };

    const findPostId = () => {
        const postElement = document.querySelector('[id^="post-"]');
        return postElement ? postElement.id : null;
    };

    // ========== EXTRACT DATA ==========
    const extractData = () => {
        const postId = findPostId();
        if (!postId) {
            console.error('❌ Không tìm thấy post ID!');
            return null;
        }
        console.log('📌 Post ID:', postId);

        const data = {
            title: '',
            author: '',
            genres: [],       // Thể loại
            type: '',         // Loại
            status: '',       // Trạng thái
            totalChapters: 0, // Số tập
            description: '',
            thumbnailUrl: '',
            chapters: [],
        };

        // ===== TITLE =====
        const titleXPath = `//*[@id="${postId}"]/header/h1`;
        const titleEl = getByXPath(titleXPath);
        data.title = titleEl?.textContent?.trim() || '';

        // ===== THÔNG TIN TRUYỆN =====
        const infoXPath = `//*[@id="${postId}"]/div[2]/div[1]`;
        const infoEl = getByXPath(infoXPath);

        if (infoEl) {
            const infoText = infoEl.innerText || infoEl.textContent || '';

            // Parse từng dòng thông tin
            const lines = infoText.split('\n').map(l => l.trim()).filter(Boolean);

            for (const line of lines) {
                // Tác giả
                if (line.includes('Tác giả:')) {
                    data.author = line.replace('Tác giả:', '').trim();
                }
                // Thể loại
                else if (line.includes('Thể loại:')) {
                    const genres = line.replace('Thể loại:', '').trim();
                    data.genres = genres.split(',').map(g => g.trim()).filter(Boolean);
                }
                // Loại
                else if (line.includes('Loại:')) {
                    data.type = line.replace('Loại:', '').trim();
                }
                // Trạng thái
                else if (line.includes('Trạng thái:')) {
                    data.status = line.replace('Trạng thái:', '').trim();
                }
                // Số tập
                else if (line.includes('Số tập:')) {
                    const match = line.match(/\d+/);
                    if (match) data.totalChapters = parseInt(match[0]);
                }
            }

            // Mô tả - lấy đoạn text dài nhất (thường là mô tả)
            const paragraphs = infoEl.querySelectorAll('p');
            let longestText = '';
            paragraphs.forEach(p => {
                const text = p.textContent?.trim() || '';
                if (text.length > longestText.length && !text.includes('Tác giả') && !text.includes('Thể loại')) {
                    longestText = text;
                }
            });

            // Fallback: lấy text sau "Lượt nghe:" hoặc text dài
            if (!longestText) {
                const allText = infoText;
                const descMatch = allText.match(/Lượt nghe:[\s\S]*?\n([\s\S]+)/);
                if (descMatch) {
                    longestText = descMatch[1].trim();
                }
            }

            data.description = longestText;
        }

        // ===== THUMBNAIL =====
        const thumbEl = document.querySelector('.entry-content img, .post-thumbnail img, article img, .wp-post-image, img[src*="wp-content"]');
        data.thumbnailUrl = thumbEl?.src || '';

        // ===== LIST TẬP TRUYỆN =====
        // Sử dụng class selector thay vì XPath
        const audioContainer = document.querySelector('.tad-field-content-audio');

        if (audioContainer) {
            const items = audioContainer.querySelectorAll('.tad-field-content-items');
            data.chapters = Array.from(items).map((item, index) => {
                // Lấy URL audio từ id của thẻ <b class="paly-audio-list">
                const audioEl = item.querySelector('b.paly-audio-list');
                const audioUrl = audioEl?.id || '';

                // Lấy title từ #single-audio-title
                const titleEl = item.querySelector('#single-audio-title');
                const title = titleEl?.textContent?.trim() || `Tập ${index + 1}`;

                return {
                    title: title,
                    audioUrl: audioUrl,
                    index: index + 1,
                };
            });
        }

        return data;
    };

    const data = extractData();

    if (!data) return;

    console.log('');
    console.log('📦 ========== DỮ LIỆU ĐÃ EXTRACT ==========');
    console.log('  Title:', data.title || '❌');
    console.log('  Author:', data.author || '❌');
    console.log('  Genres:', data.genres.length ? data.genres.join(', ') : '❌');
    console.log('  Type:', data.type || '❌');
    console.log('  Status:', data.status || '❌');
    console.log('  Total Chapters:', data.totalChapters);
    console.log('  Description:', data.description ? `${data.description.substring(0, 80)}...` : '❌');
    console.log('  Chapters Found:', data.chapters.length);
    console.log('  Thumbnail:', data.thumbnailUrl ? '✅' : '❌');
    console.log('============================================');
    console.log('');

    if (!data.title) {
        console.error('❌ Không tìm thấy title! Dừng crawl.');
        return;
    }

    // ========== GỬI LÊN API ==========
    console.log('📤 Đang gửi lên API...');

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.TOKEN}`,
            },
            body: JSON.stringify({
                title: data.title,
                author: data.author,
                description: data.description,
                thumbnailUrl: data.thumbnailUrl,
                genres: data.genres,
                chapters: data.chapters,  // ← Thêm chapters
                sourceUrl: window.location.href,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('');
            console.log('✅ ========== THÀNH CÔNG ==========');
            console.log('  Book ID:', result.id);
            console.log('  Slug:', result.slug);
            console.log('===================================');
            console.log('');
            console.log('📋 Chapters đã tìm thấy:', data.chapters.length);

            if (data.chapters.length > 0) {
                console.log('📝 5 chapters đầu tiên:');
                data.chapters.slice(0, 5).forEach(ch => {
                    console.log(`   ${ch.index}. ${ch.title}`);
                });
            }
        } else {
            console.error('❌ Lỗi:', result.error);
        }
    } catch (error) {
        console.error('❌ Lỗi kết nối:', error.message);
    }
})();
