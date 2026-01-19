<?php
/**
 * Search API
 * 
 * GET /api/search.php?q=keyword - Search books by title/description
 */

require_once __DIR__ . '/../config.php';

$db = getDB();

$query = trim($_GET['q'] ?? '');

if (strlen($query) < 2) {
    jsonResponse(['error' => 'Query must be at least 2 characters'], 400);
}

$page = max(1, intval($_GET['page'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

// Use FULLTEXT search if available, fallback to LIKE
// Use FULLTEXT search if available, fallback to LIKE
$searchTerm = "%$query%";

// Convert query to slug for accent-insensitive search (e.g. "dau pha" -> "dau-pha")
$searchSlug = createSlug($query);
$searchSlugTerm = "%$searchSlug%";

$stmt = $db->prepare("
    SELECT b.id, b.title, b.slug, b.thumbnail_url, b.total_chapters,
           a.name as author_name, a.slug as author_slug,
           MATCH(b.title, b.description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    WHERE b.is_published = 1 
      AND (
          b.title LIKE ? 
          OR b.description LIKE ? 
          OR a.name LIKE ?
          OR b.slug LIKE ?
          OR a.slug LIKE ?
      )
    ORDER BY relevance DESC, b.view_count DESC
    LIMIT $limit OFFSET $offset
");
$stmt->execute([$query, $searchTerm, $searchTerm, $searchTerm, $searchSlugTerm, $searchSlugTerm]);
$books = $stmt->fetchAll();

// Get genres for each
foreach ($books as &$book) {
    $stmt = $db->prepare("
        SELECT g.name, g.slug FROM genres g
        JOIN book_genres bg ON g.id = bg.genre_id
        WHERE bg.book_id = ?
    ");
    $stmt->execute([$book['id']]);
    $book['genres'] = $stmt->fetchAll();
}

// Count total for pagination
$countStmt = $db->prepare("
    SELECT COUNT(*)
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    WHERE b.is_published = 1 
      AND (
          b.title LIKE ? 
          OR b.description LIKE ? 
          OR a.name LIKE ?
          OR b.slug LIKE ?
          OR a.slug LIKE ?
      )
");
$countStmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchSlugTerm, $searchSlugTerm]);
$total = $countStmt->fetchColumn();

jsonResponse([
    'query' => $query,
    'data' => $books,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => intval($total),
        'totalPages' => ceil($total / $limit)
    ]
]);
