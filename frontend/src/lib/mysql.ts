import mysql from 'mysql2/promise';

// Create a connection pool for MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'audio_truyen',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    // Vercel/Serverless: Use strict limit (1) to prevent "Too many connections"
    // Local: Use pool (10) for performance
    connectionLimit: process.env.NODE_ENV === 'production' ? 1 : 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export default pool;
