-- ============================================
-- Performance Indexes for AudioTruyen Database
-- Run this in phpMyAdmin to improve query speed
-- ============================================

-- Books table indexes
CREATE INDEX IF NOT EXISTS idx_books_is_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
CREATE INDEX IF NOT EXISTS idx_books_view_count ON books(view_count);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);

-- Chapters table indexes
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_index ON chapters(chapter_index);

-- Book_genres junction table indexes
CREATE INDEX IF NOT EXISTS idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre_id ON book_genres(genre_id);

-- Genres table indexes
CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);

-- Authors table indexes
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- UUID indexes (for API lookups)
CREATE INDEX IF NOT EXISTS idx_books_uuid ON books(uuid);
CREATE INDEX IF NOT EXISTS idx_chapters_uuid ON chapters(uuid);
CREATE INDEX IF NOT EXISTS idx_genres_uuid ON genres(uuid);
CREATE INDEX IF NOT EXISTS idx_authors_uuid ON authors(uuid);
