-- ============================================
-- Sample Data for Testing
-- ============================================

-- Insert Authors
INSERT INTO authors (name, slug, avatar_url) VALUES
('Ngã Cật Tây Hồng Thị', 'nga-cat-tay-hong-thi', NULL),
('Thiên Tàm Thổ Đậu', 'thien-tam-tho-dau', NULL),
('Nhĩ Căn', 'nhi-can', NULL),
('Đường Gia Tam Thiếu', 'duong-gia-tam-thieu', NULL),
('Tiêu Tiềm', 'tieu-tiem', NULL);

-- Insert more genres if not exist (schema already has some)
INSERT IGNORE INTO genres (name, slug) VALUES
('Huyền Huyễn', 'huyen-huyen'),
('Đô Thị', 'do-thi'),
('Võng Du', 'vong-du'),
('Khoa Huyễn', 'khoa-huyen');

-- Insert Books
INSERT INTO books (author_id, title, slug, description, thumbnail_url, source_url, total_chapters, view_count) VALUES
(1, 'Đấu La Đại Lục', 'dau-la-dai-luc', 
 'Đường Môn ngoại môn đệ tử Đường Tam, nhân ăn cắp nội môn bí học mà bị truy sát, sau khi nhảy xuống vực, được tái sinh sang thế giới khác mang theo ký ức tiền kiếp.',
 'https://via.placeholder.com/300x400/FF6B35/FFFFFF?text=Dau+La', 
 'https://example.com/dau-la', 10, 125000),

(2, 'Đấu Phá Thương Khung', 'dau-pha-thuong-khung',
 'Tiêu Viêm là thiên tài trẻ tuổi xưa nay hiếm có, ở tuổi 11 đã đạt đến Đấu Chi Khí tầng 10, được kỳ vọng sẽ trở thành nhân vật xuất sắc.',
 'https://via.placeholder.com/300x400/3498db/FFFFFF?text=Dau+Pha',
 'https://example.com/dau-pha', 8, 98000),

(3, 'Tiên Nghịch', 'tien-nghich',
 'Thuận thiên giả, không nhất định là đúng. Nghịch thiên giả, không nhất định là sai! Thuận hay nghịch, không ở nơi trời, mà ở nơi lòng người!',
 'https://via.placeholder.com/300x400/9b59b6/FFFFFF?text=Tien+Nghich',
 'https://example.com/tien-nghich', 12, 87000),

(4, 'Thần Ấn Vương Tọa', 'than-an-vuong-toa',
 'Ma tộc xâm chiếm, nhân loại lâm vào kỷ nguyên đen tối. Từ đó, nhân loại bước vào thời kỳ phát triển mạnh mẽ.',
 'https://via.placeholder.com/300x400/e74c3c/FFFFFF?text=Than+An',
 'https://example.com/than-an', 15, 76000),

(5, 'Tru Tiên', 'tru-tien',
 'Truyện kể về Trương Tiểu Phàm - một cậu bé bình thường ngày nào cũng tưới nước cho cây linh chi cổ thụ trong thôn.',
 'https://via.placeholder.com/300x400/2ecc71/FFFFFF?text=Tru+Tien',
 'https://example.com/tru-tien', 10, 145000);

-- Link books to genres
INSERT INTO book_genres (book_id, genre_id) VALUES
-- Đấu La Đại Lục - Tiên Hiệp, Huyền Huyễn
(1, 1), (1, (SELECT id FROM genres WHERE slug = 'huyen-huyen')),
-- Đấu Phá - Tiên Hiệp  
(2, 1),
-- Tiên Nghịch - Tiên Hiệp
(3, 1),
-- Thần Ấn - Huyền Huyễn
(4, (SELECT id FROM genres WHERE slug = 'huyen-huyen')),
-- Tru Tiên - Tiên Hiệp, Kiếm Hiệp
(5, 1), (5, 2);

-- Insert Chapters for "Đấu La Đại Lục"
INSERT INTO chapters (book_id, title, chapter_index, audio_url, duration_seconds) VALUES
(1, 'Chương 1: Đường Môn Đường Tam', 1, 'https://archive.org/download/sample-audio/chapter1.mp3', 1800),
(1, 'Chương 2: Thế Giới Khác', 2, 'https://archive.org/download/sample-audio/chapter2.mp3', 2100),
(1, 'Chương 3: Đấu Hồn Giác Tỉnh', 3, 'https://archive.org/download/sample-audio/chapter3.mp3', 1950),
(1, 'Chương 4: Song Sinh Vũ Hồn', 4, 'https://archive.org/download/sample-audio/chapter4.mp3', 2200),
(1, 'Chương 5: Lam Ngân Thảo', 5, 'https://archive.org/download/sample-audio/chapter5.mp3', 1850),
(1, 'Chương 6: Tiểu Vũ', 6, 'https://archive.org/download/sample-audio/chapter6.mp3', 2050),
(1, 'Chương 7: Thất Bảo Lưu Li Tông', 7, 'https://archive.org/download/sample-audio/chapter7.mp3', 1900),
(1, 'Chương 8: Đấu La Đại Lục', 8, 'https://archive.org/download/sample-audio/chapter8.mp3', 2150),
(1, 'Chương 9: Vũ Hồn Điện', 9, 'https://archive.org/download/sample-audio/chapter9.mp3', 2000),
(1, 'Chương 10: Tu Luyện', 10, 'https://archive.org/download/sample-audio/chapter10.mp3', 1800);

-- Insert Chapters for "Đấu Phá Thương Khung"
INSERT INTO chapters (book_id, title, chapter_index, audio_url, duration_seconds) VALUES
(2, 'Chương 1: Thiên Tài Suy Lạc', 1, 'https://archive.org/download/sample-audio/dpck1.mp3', 1750),
(2, 'Chương 2: Tiêu Huân', 2, 'https://archive.org/download/sample-audio/dpck2.mp3', 1900),
(2, 'Chương 3: Dược Lão', 3, 'https://archive.org/download/sample-audio/dpck3.mp3', 2100),
(2, 'Chương 4: Phần Thiên Quyết', 4, 'https://archive.org/download/sample-audio/dpck4.mp3', 1850),
(2, 'Chương 5: Rèn Luyện', 5, 'https://archive.org/download/sample-audio/dpck5.mp3', 2000),
(2, 'Chương 6: Lão Lão', 6, 'https://archive.org/download/sample-audio/dpck6.mp3', 1950),
(2, 'Chương 7: Tiêu Gia', 7, 'https://archive.org/download/sample-audio/dpck7.mp3', 2050),
(2, 'Chương 8: Đấu Khí Đại Lục', 8, 'https://archive.org/download/sample-audio/dpck8.mp3', 1800);

-- Insert Chapters for "Tiên Nghịch"
INSERT INTO chapters (book_id, title, chapter_index, audio_url, duration_seconds) VALUES
(3, 'Chương 1: Tố Gia Thôn', 1, 'https://archive.org/download/sample-audio/tn1.mp3', 1820),
(3, 'Chương 2: Thiết Thụ', 2, 'https://archive.org/download/sample-audio/tn2.mp3', 1950),
(3, 'Chương 3: Tố Nhân', 3, 'https://archive.org/download/sample-audio/tn3.mp3', 2100),
(3, 'Chương 4: Tu Tiên', 4, 'https://archive.org/download/sample-audio/tn4.mp3', 1880),
(3, 'Chương 5: Hằng Nguyệt Tông', 5, 'https://archive.org/download/sample-audio/tn5.mp3', 2200),
(3, 'Chương 6: Ngoại Môn Nội Môn', 6, 'https://archive.org/download/sample-audio/tn6.mp3', 1750),
(3, 'Chương 7: Linh Thạch', 7, 'https://archive.org/download/sample-audio/tn7.mp3', 1900),
(3, 'Chương 8: Thuận Nghịch', 8, 'https://archive.org/download/sample-audio/tn8.mp3', 2050),
(3, 'Chương 9: Bản Mệnh', 9, 'https://archive.org/download/sample-audio/tn9.mp3', 1980),
(3, 'Chương 10: Tu Luyện Chi Đạo', 10, 'https://archive.org/download/sample-audio/tn10.mp3', 2100),
(3, 'Chương 11: Kiếp Nạn', 11, 'https://archive.org/download/sample-audio/tn11.mp3', 1850),
(3, 'Chương 12: Kết Thúc Mở Đầu', 12, 'https://archive.org/download/sample-audio/tn12.mp3', 2250);

-- Insert Chapters for other books
INSERT INTO chapters (book_id, title, chapter_index, audio_url, duration_seconds) VALUES
(4, 'Chương 1: Long Hao Thần', 1, 'https://archive.org/download/sample-audio/tavt1.mp3', 1900),
(4, 'Chương 2: Kỵ Sĩ Học Viện', 2, 'https://archive.org/download/sample-audio/tavt2.mp3', 2000),
(4, 'Chương 3: Thánh Kiếm', 3, 'https://archive.org/download/sample-audio/tavt3.mp3', 1850),
(5, 'Chương 1: Thảo Miếu Thôn', 1, 'https://archive.org/download/sample-audio/tt1.mp3', 2100),
(5, 'Chương 2: Thiên Âm Tự', 2, 'https://archive.org/download/sample-audio/tt2.mp3', 1950),
(5, 'Chương 3: Thanh Vân Môn', 3, 'https://archive.org/download/sample-audio/tt3.mp3', 2050);
