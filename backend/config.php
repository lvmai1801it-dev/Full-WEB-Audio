<?php
/**
 * Database Configuration
 * Website Nghe Truyện Audio
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// CORS cho Next.js frontend - Chỉ allow specific origins
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    getenv('ALLOWED_ORIGIN') ?: ''
];
$allowedOrigins = array_filter($allowedOrigins); // Remove empty

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (php_sapi_name() === 'cli' || empty($origin)) {
    // Allow CLI and same-origin requests
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database credentials (support Docker env vars)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'audio_truyen');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Get PDO connection
 */
function getDB(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Database connection failed'], 500);
        }
    }

    return $pdo;
}

/**
 * Send JSON response
 */
function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Get request input
 */
function getInput(): array
{
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?? [];
}

/**
 * Create URL slug from Vietnamese text
 */
function createSlug(string $text): string
{
    $vietnamese = [
        'à',
        'á',
        'ạ',
        'ả',
        'ã',
        'â',
        'ầ',
        'ấ',
        'ậ',
        'ẩ',
        'ẫ',
        'ă',
        'ằ',
        'ắ',
        'ặ',
        'ẳ',
        'ẵ',
        'è',
        'é',
        'ẹ',
        'ẻ',
        'ẽ',
        'ê',
        'ề',
        'ế',
        'ệ',
        'ể',
        'ễ',
        'ì',
        'í',
        'ị',
        'ỉ',
        'ĩ',
        'ò',
        'ó',
        'ọ',
        'ỏ',
        'õ',
        'ô',
        'ồ',
        'ố',
        'ộ',
        'ổ',
        'ỗ',
        'ơ',
        'ờ',
        'ớ',
        'ợ',
        'ở',
        'ỡ',
        'ù',
        'ú',
        'ụ',
        'ủ',
        'ũ',
        'ư',
        'ừ',
        'ứ',
        'ự',
        'ử',
        'ữ',
        'ỳ',
        'ý',
        'ỵ',
        'ỷ',
        'ỹ',
        'đ',
        'À',
        'Á',
        'Ạ',
        'Ả',
        'Ã',
        'Â',
        'Ầ',
        'Ấ',
        'Ậ',
        'Ẩ',
        'Ẫ',
        'Ă',
        'Ằ',
        'Ắ',
        'Ặ',
        'Ẳ',
        'Ẵ',
        'È',
        'É',
        'Ẹ',
        'Ẻ',
        'Ẽ',
        'Ê',
        'Ề',
        'Ế',
        'Ệ',
        'Ể',
        'Ễ',
        'Ì',
        'Í',
        'Ị',
        'Ỉ',
        'Ĩ',
        'Ò',
        'Ó',
        'Ọ',
        'Ỏ',
        'Õ',
        'Ô',
        'Ồ',
        'Ố',
        'Ộ',
        'Ổ',
        'Ỗ',
        'Ơ',
        'Ờ',
        'Ớ',
        'Ợ',
        'Ở',
        'Ỡ',
        'Ù',
        'Ú',
        'Ụ',
        'Ủ',
        'Ũ',
        'Ư',
        'Ừ',
        'Ứ',
        'Ự',
        'Ử',
        'Ữ',
        'Ỳ',
        'Ý',
        'Ỵ',
        'Ỷ',
        'Ỹ',
        'Đ'
    ];

    $ascii = [
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'i',
        'i',
        'i',
        'i',
        'i',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'y',
        'y',
        'y',
        'y',
        'y',
        'd',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'a',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'e',
        'i',
        'i',
        'i',
        'i',
        'i',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'u',
        'y',
        'y',
        'y',
        'y',
        'y',
        'd'
    ];

    $text = str_replace($vietnamese, $ascii, $text);
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    $text = trim($text, '-');

    return $text;
}
