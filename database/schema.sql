-- ============================================
-- Website Nghe Truyện Audio - Database Schema
-- MySQL 5.7+ / MariaDB 10.3+
-- ============================================

-- Tác giả
CREATE TABLE IF NOT EXISTS authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thể loại
CREATE TABLE IF NOT EXISTS genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Truyện/Sách
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    source_url TEXT,
    total_chapters INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
    INDEX idx_view_count (view_count DESC),
    INDEX idx_created (created_at DESC),
    FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Truyện - Thể loại (Many-to-Many)
CREATE TABLE IF NOT EXISTS book_genres (
    book_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chapters/Episodes
CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    chapter_index INT NOT NULL,
    audio_url TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY idx_book_chapter (book_id, chapter_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crawl Queue (cho crawler đọc)
CREATE TABLE IF NOT EXISTS crawl_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_url TEXT NOT NULL,
    status ENUM('pending', 'processing', 'done', 'failed') DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data
-- ============================================
INSERT INTO genres (name, slug) VALUES 
('Tiên Hiệp', 'tien-hiep'),
('Kiếm Hiệp', 'kiem-hiep'),
('Ngôn Tình', 'ngon-tinh'),
('Trinh Thám', 'trinh-tham'),
('Kinh Dị', 'kinh-di'),
('Hài Hước', 'hai-huoc'),
('Lịch Sử', 'lich-su'),
('Truyện Ma', 'truyen-ma');
