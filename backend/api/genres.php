<?php
/**
 * Genres API
 * 
 * GET /api/genres.php - List all genres with book count
 */

require_once __DIR__ . '/../config.php';

$db = getDB();

$stmt = $db->query("
    SELECT g.id, g.name, g.slug, COUNT(bg.book_id) as book_count
    FROM genres g
    LEFT JOIN book_genres bg ON g.id = bg.genre_id
    LEFT JOIN books b ON bg.book_id = b.id AND b.is_published = 1
    GROUP BY g.id
    ORDER BY g.name ASC
");

jsonResponse($stmt->fetchAll());
