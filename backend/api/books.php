<?php
/**
 * Books API
 * 
 * GET /api/books.php              - List all books (paginated)
 * GET /api/books.php?slug=xxx     - Get book by slug with chapters
 * GET /api/books.php?genre=xxx    - Filter by genre slug
 * GET /api/books.php?author=xxx   - Filter by author slug
 */

require_once __DIR__ . '/../config.php';

$db = getDB();

// Get single book by slug
if (isset($_GET['slug'])) {
    $slug = $_GET['slug'];
    
    // Get book info
    $stmt = $db->prepare("
        SELECT b.*, a.name as author_name, a.slug as author_slug
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        WHERE b.slug = ? AND b.is_published = 1
    ");
    $stmt->execute([$slug]);
    $book = $stmt->fetch();
    
    if (!$book) {
        jsonResponse(['error' => 'Book not found'], 404);
    }
    
    // Get genres
    $stmt = $db->prepare("
        SELECT g.id, g.name, g.slug
        FROM genres g
        JOIN book_genres bg ON g.id = bg.genre_id
        WHERE bg.book_id = ?
    ");
    $stmt->execute([$book['id']]);
    $book['genres'] = $stmt->fetchAll();
    
    // Get chapters
    $stmt = $db->prepare("
        SELECT id, title, chapter_index, audio_url, duration_seconds
        FROM chapters
        WHERE book_id = ?
        ORDER BY chapter_index ASC
    ");
    $stmt->execute([$book['id']]);
    $book['chapters'] = $stmt->fetchAll();
    
    // Update view count
    $db->prepare("UPDATE books SET view_count = view_count + 1 WHERE id = ?")
       ->execute([$book['id']]);
    
    jsonResponse($book);
}

// List books with pagination
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$where = "WHERE b.is_published = 1";
$params = [];

// Filter by genre
if (isset($_GET['genre'])) {
    $where .= " AND b.id IN (
        SELECT bg.book_id FROM book_genres bg
        JOIN genres g ON bg.genre_id = g.id
        WHERE g.slug = ?
    )";
    $params[] = $_GET['genre'];
}

// Filter by author
if (isset($_GET['author'])) {
    $where .= " AND a.slug = ?";
    $params[] = $_GET['author'];
}

// Sort
$sort = $_GET['sort'] ?? 'latest';
$orderBy = match($sort) {
    'popular' => 'b.view_count DESC',
    'name' => 'b.title ASC',
    default => 'b.created_at DESC'
};

// Count total
$stmt = $db->prepare("
    SELECT COUNT(*) FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    $where
");
$stmt->execute($params);
$total = $stmt->fetchColumn();

// Get books
$stmt = $db->prepare("
    SELECT b.id, b.title, b.slug, b.thumbnail_url, b.total_chapters, b.view_count,
           a.name as author_name, a.slug as author_slug
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    $where
    ORDER BY $orderBy
    LIMIT $limit OFFSET $offset
");
$stmt->execute($params);
$books = $stmt->fetchAll();

// Get genres for each book
foreach ($books as &$book) {
    $stmt = $db->prepare("
        SELECT g.name, g.slug
        FROM genres g
        JOIN book_genres bg ON g.id = bg.genre_id
        WHERE bg.book_id = ?
    ");
    $stmt->execute([$book['id']]);
    $book['genres'] = $stmt->fetchAll();
}

jsonResponse([
    'data' => $books,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => intval($total),
        'totalPages' => ceil($total / $limit)
    ]
]);
