<?php
/**
 * Crawl Queue API (Admin)
 * 
 * POST /api/crawl.php - Add URL to crawl queue (requires auth)
 * GET  /api/crawl.php - List queue status (public)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Require auth for adding to queue
    requireAuth();
    $input = getInput();
    $url = trim($input['url'] ?? '');

    if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
        jsonResponse(['error' => 'Invalid URL'], 400);
    }

    // Check if already in queue
    $stmt = $db->prepare("SELECT id FROM crawl_queue WHERE target_url = ? AND status IN ('pending', 'processing')");
    $stmt->execute([$url]);

    if ($stmt->fetch()) {
        jsonResponse(['error' => 'URL already in queue'], 409);
    }

    $stmt = $db->prepare("INSERT INTO crawl_queue (target_url) VALUES (?)");
    $stmt->execute([$url]);

    jsonResponse([
        'success' => true,
        'id' => $db->lastInsertId(),
        'message' => 'Added to crawl queue'
    ], 201);
}

// GET - List queue
$stmt = $db->query("
    SELECT id, target_url, status, error_message, created_at
    FROM crawl_queue
    ORDER BY created_at DESC
    LIMIT 50
");

jsonResponse($stmt->fetchAll());
