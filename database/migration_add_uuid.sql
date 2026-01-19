-- ============================================
-- Migration: Add UUID to books table
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================

-- 1. Add uuid column
ALTER TABLE books ADD COLUMN uuid VARCHAR(36) UNIQUE AFTER id;

-- 2. Generate UUID for existing books
UPDATE books SET uuid = UUID() WHERE uuid IS NULL;

-- 3. Make uuid NOT NULL after populating
ALTER TABLE books MODIFY uuid VARCHAR(36) NOT NULL;

-- Create index for faster lookup
CREATE INDEX idx_books_uuid ON books(uuid);

-- Note: API will now use uuid instead of id for public access
-- Internal FK relations still use numeric id for performance
