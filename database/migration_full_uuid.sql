-- ============================================
-- Full Hybrid UUID Migration
-- Run this in phpMyAdmin to enable UUID support
-- ============================================

-- 1. Add UUID columns (initially nullable)
ALTER TABLE books ADD COLUMN IF NOT EXISTS uuid CHAR(36) UNIQUE AFTER id;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS uuid CHAR(36) UNIQUE AFTER id;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS uuid CHAR(36) UNIQUE AFTER id;
ALTER TABLE genres ADD COLUMN IF NOT EXISTS uuid CHAR(36) UNIQUE AFTER id;

-- 2. Generate UUIDs for existing data where missing
UPDATE books SET uuid = UUID() WHERE uuid IS NULL;
UPDATE chapters SET uuid = UUID() WHERE uuid IS NULL;
UPDATE authors SET uuid = UUID() WHERE uuid IS NULL;
UPDATE genres SET uuid = UUID() WHERE uuid IS NULL;

-- 3. Enforce NOT NULL constraint
ALTER TABLE books MODIFY uuid CHAR(36) NOT NULL;
ALTER TABLE chapters MODIFY uuid CHAR(36) NOT NULL;
ALTER TABLE authors MODIFY uuid CHAR(36) NOT NULL;
ALTER TABLE genres MODIFY uuid CHAR(36) NOT NULL;

-- 4. Create explicit indexes (if not created by UNIQUE constraint)
-- Note: MySQL UNIQUE constraint already creates an index, but explicit naming is good practice if needed.
-- Skipping explicit CREATE INDEX as UNIQUE creates one.
