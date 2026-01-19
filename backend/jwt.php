<?php
/**
 * JWT Authentication Utility
 * Simple JWT implementation without external dependencies
 */

require_once __DIR__ . '/config.php';

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'xeon-audio-secret-key-change-in-production');
define('JWT_EXPIRY', 3600 * 24); // 24 hours

/**
 * Base64 URL encode
 */
function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generate JWT token
 */
function generateJWT(array $payload): string
{
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);

    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;

    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}

/**
 * Verify and decode JWT token
 * Returns payload array or null if invalid
 */
function verifyJWT(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$base64Header, $base64Payload, $base64Signature] = $parts;

    // Verify signature
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $expectedSignature = base64UrlEncode($signature);

    if (!hash_equals($expectedSignature, $base64Signature)) {
        return null;
    }

    // Decode payload
    $payload = json_decode(base64UrlDecode($base64Payload), true);
    if (!$payload) {
        return null;
    }

    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

/**
 * Get token from Authorization header
 */
function getBearerToken(): ?string
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return $matches[1];
    }

    return null;
}

/**
 * Middleware: Require valid JWT authentication
 * Terminates with 401 if not authenticated
 */
function requireAuth(): array
{
    $token = getBearerToken();

    if (!$token) {
        jsonResponse(['error' => 'No authentication token provided'], 401);
    }

    $payload = verifyJWT($token);

    if (!$payload) {
        jsonResponse(['error' => 'Invalid or expired token'], 401);
    }

    return $payload;
}

/**
 * Optional auth - returns payload or null without terminating
 */
function getAuthUser(): ?array
{
    $token = getBearerToken();
    if (!$token) {
        return null;
    }
    return verifyJWT($token);
}
