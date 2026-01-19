import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hashPassword } from '@/lib/auth';

// GET /api/seed - Create default admin (only works if no admin exists)
export async function GET() {
    try {
        // Check if admin exists
        const [admins] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM admins WHERE username = ? LIMIT 1',
            ['admin']
        );

        if (admins.length > 0) {
            return Response.json({
                message: 'Admin already exists',
                hint: 'Login with username: admin',
            });
        }

        // Create default admin
        const passwordHash = await hashPassword('admin123');
        await pool.query<ResultSetHeader>(
            'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
            ['admin', passwordHash]
        );

        return Response.json({
            success: true,
            message: 'Default admin created',
            credentials: {
                username: 'admin',
                password: 'admin123',
            },
            warning: 'Change this password in production!',
        });
    } catch (error) {
        console.error('Seed API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
