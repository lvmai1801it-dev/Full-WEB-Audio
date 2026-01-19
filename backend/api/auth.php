<?php
/**
 * Authentication API
 * 
 * POST /api/auth.php - Login and get JWT token
 * GET  /api/auth.php - Verify current token
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        handleLogin();
    } elseif ($method === 'GET') {
        handleVerify();
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}

/**
 * Handle login request
 */
function handleLogin(): void
{
    $input = getInput();

    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'Username and password are required'], 400);
    }

    $db = getDB();

    // Find admin by username
    $stmt = $db->prepare("SELECT id, username, password_hash FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin) {
        // Use constant time comparison to prevent timing attacks
        password_verify($password, '$2y$10$dummyhashtopreventtimingattack');
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    // Verify password
    if (!password_verify($password, $admin['password_hash'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    // Generate JWT token
    $token = generateJWT([
        'sub' => $admin['id'],
        'username' => $admin['username'],
        'role' => 'admin'
    ]);

    jsonResponse([
        'success' => true,
        'token' => $token,
        'expiresIn' => JWT_EXPIRY,
        'user' => [
            'id' => $admin['id'],
            'username' => $admin['username']
        ]
    ]);
}

/**
 * Handle token verification
 */
function handleVerify(): void
{
    $payload = requireAuth();

    jsonResponse([
        'valid' => true,
        'user' => [
            'id' => $payload['sub'],
            'username' => $payload['username']
        ]
    ]);
}
