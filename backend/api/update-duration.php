<?php
/**
 * Update chapter duration after audio metadata is loaded
 */
require_once __DIR__ . '/../config.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = getInput();

// Validate
if (empty($input['chapter_id']) || empty($input['duration'])) {
    jsonResponse(['error' => 'chapter_id and duration are required'], 400);
}

$chapterId = (int) $input['chapter_id'];
$duration = (int) $input['duration'];

// Validate duration (must be positive and less than 24 hours)
if ($duration <= 0 || $duration > 86400) {
    jsonResponse(['error' => 'Invalid duration'], 400);
}

try {
    $db = getDB();

    // Only update if current duration is 0 (not yet set)
    $stmt = $db->prepare("UPDATE chapters SET duration_seconds = ? WHERE id = ? AND duration_seconds = 0");
    $stmt->execute([$duration, $chapterId]);

    $updated = $stmt->rowCount() > 0;

    jsonResponse([
        'success' => true,
        'updated' => $updated,
        'chapter_id' => $chapterId,
        'duration' => $duration
    ]);

} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
