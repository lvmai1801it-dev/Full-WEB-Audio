<?php
/**
 * Admin API - Manage Books (CRUD)
 * Protected by JWT authentication
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';

// Require authentication for all admin operations
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            if ($action === 'list') {
                handleListBooks($db);
            } else if (isset($_GET['id'])) {
                handleGetBook($db, intval($_GET['id']));
            } else {
                jsonResponse(['error' => 'Invalid action'], 400);
            }
            break;

        case 'POST':
            handleCreateOrCrawl($db);
            break;

        case 'PUT':
            handleUpdateBook($db);
            break;

        case 'DELETE':
            handleDeleteBook($db);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(['error' => $e->getMessage()], 500);
}

// --- Handlers ---

function handleListBooks($db)
{
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $search = $_GET['q'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if ($search) {
        $where .= " AND (b.title LIKE ? OR a.name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    // Count
    $stmt = $db->prepare("SELECT COUNT(*) FROM books b LEFT JOIN authors a ON b.author_id = a.id $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    // Get Data
    $stmt = $db->prepare("
        SELECT b.id, b.title, b.slug, b.is_published, b.view_count, b.created_at,
               a.name as author_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        $where
        ORDER BY b.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $books = $stmt->fetchAll();

    jsonResponse([
        'data' => $books,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'totalPages' => ceil($total / $limit)
        ]
    ]);
}

function handleGetBook($db, $id)
{
    $stmt = $db->prepare("SELECT * FROM books WHERE id = ?");
    $stmt->execute([$id]);
    $book = $stmt->fetch();
    if (!$book)
        jsonResponse(['error' => 'Not found'], 404);
    jsonResponse($book);
}

function handleCreateOrCrawl($db)
{
    $input = getInput();

    // Validate
    if (empty($input['title'])) {
        jsonResponse(['error' => 'Title is required'], 400);
    }

    $db->beginTransaction();

    // 1. Author
    $authorId = null;
    if (!empty($input['author'])) {
        $authorSlug = createSlug($input['author']);
        $stmt = $db->prepare("SELECT id FROM authors WHERE slug = ?");
        $stmt->execute([$authorSlug]);
        $author = $stmt->fetch();

        if ($author) {
            $authorId = $author['id'];
        } else {
            $stmt = $db->prepare("INSERT INTO authors (name, slug) VALUES (?, ?)");
            $stmt->execute([$input['author'], $authorSlug]);
            $authorId = $db->lastInsertId();
        }
    }

    // 2. Book
    $bookSlug = createSlug($input['title']);
    $stmt = $db->prepare("SELECT id FROM books WHERE slug = ?");
    $stmt->execute([$bookSlug]);
    $existing = $stmt->fetch();

    if ($existing) {
        $bookId = $existing['id'];
        $stmt = $db->prepare("UPDATE books SET 
            author_id = ?, title = ?, description = ?, thumbnail_url = ?, source_url = ?, updated_at = NOW()
            WHERE id = ?");
        $stmt->execute([
            $authorId,
            $input['title'],
            $input['description'] ?? null,
            $input['thumbnail'] ?? null,
            $input['sourceUrl'] ?? null,
            $bookId
        ]);
    } else {
        $stmt = $db->prepare("INSERT INTO books 
            (author_id, title, slug, description, thumbnail_url, source_url, total_chapters, is_published) 
            VALUES (?, ?, ?, ?, ?, ?, 0, 1)");
        $stmt->execute([
            $authorId,
            $input['title'],
            $bookSlug,
            $input['description'] ?? null,
            $input['thumbnail'] ?? null,
            $input['sourceUrl'] ?? null
        ]);
        $bookId = $db->lastInsertId();
    }

    // 3. Genres
    if (!empty($input['genres']) && is_array($input['genres'])) {
        $stmt = $db->prepare("DELETE FROM book_genres WHERE book_id = ?");
        $stmt->execute([$bookId]);

        foreach ($input['genres'] as $genreName) {
            $genreSlug = createSlug($genreName);
            $stmt = $db->prepare("SELECT id FROM genres WHERE slug = ?");
            $stmt->execute([$genreSlug]);
            $genre = $stmt->fetch();

            $genreId = $genre ? $genre['id'] : null;
            if (!$genreId) {
                $stmt = $db->prepare("INSERT INTO genres (name, slug) VALUES (?, ?)");
                $stmt->execute([$genreName, $genreSlug]);
                $genreId = $db->lastInsertId();
            }

            $db->prepare("INSERT IGNORE INTO book_genres (book_id, genre_id) VALUES (?, ?)")
                ->execute([$bookId, $genreId]);
        }
    }

    // 4. Chapters
    $chapterCount = 0;
    if (!empty($input['chapters']) && is_array($input['chapters'])) {
        foreach ($input['chapters'] as $index => $chapter) {
            $idx = $index + 1;
            $title = $chapter['title'] ?? "Chương $idx";
            $url = $chapter['audioUrl'] ?? '';
            if (!$url)
                continue;

            $stmt = $db->prepare("
                INSERT INTO chapters (book_id, title, chapter_index, audio_url, duration_seconds)
                VALUES (?, ?, ?, ?, 0)
                ON DUPLICATE KEY UPDATE audio_url = ?, title = ?
            ");
            $stmt->execute([$bookId, $title, $idx, $url, $url, $title]);
            $chapterCount++;
        }
        $db->prepare("UPDATE books SET total_chapters = ? WHERE id = ?")->execute([$chapterCount, $bookId]);
    }

    $db->commit();
    jsonResponse(['success' => true, 'bookId' => $bookId]);
}

function handleUpdateBook($db)
{
    $input = getInput();
    $id = intval($_GET['id'] ?? 0);
    if (!$id)
        jsonResponse(['error' => 'Missing ID'], 400);

    // Simple update: title, description, is_published
    $fields = [];
    $params = [];

    if (isset($input['title'])) {
        $fields[] = "title = ?";
        $params[] = $input['title'];
    }
    if (isset($input['description'])) {
        $fields[] = "description = ?";
        $params[] = $input['description'];
    }
    if (isset($input['is_published'])) {
        $fields[] = "is_published = ?";
        $params[] = intval($input['is_published']);
    }

    // Author update logic could be added here similar to Create

    if (empty($fields))
        jsonResponse(['error' => 'No fields to update'], 400);

    $params[] = $id;
    $sql = "UPDATE books SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    jsonResponse(['success' => true]);
}

function handleDeleteBook($db)
{
    $id = intval($_GET['id'] ?? 0);
    if (!$id)
        jsonResponse(['error' => 'Missing ID'], 400);

    $db->beginTransaction();
    // Delete relations (FK constraints might handle this, but being safe)
    $db->prepare("DELETE FROM chapters WHERE book_id = ?")->execute([$id]);
    $db->prepare("DELETE FROM book_genres WHERE book_id = ?")->execute([$id]);
    $db->prepare("DELETE FROM books WHERE id = ?")->execute([$id]);
    $db->commit();

    jsonResponse(['success' => true]);
}
