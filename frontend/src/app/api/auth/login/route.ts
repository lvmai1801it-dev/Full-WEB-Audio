import { NextRequest } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';
import { generateToken, verifyPassword } from '@/lib/auth';

interface AdminRow extends RowDataPacket {
    id: number;
    username: string;
    password_hash: string;
}

// POST /api/auth/login - Login and get JWT token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return Response.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find admin
        const [admins] = await pool.query<AdminRow[]>(
            'SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1',
            [username]
        );

        if (admins.length === 0) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const admin = admins[0];

        // Verify password
        const isValid = await verifyPassword(password, admin.password_hash);
        if (!isValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate token
        const token = generateToken({
            sub: admin.id.toString(),
            username: admin.username,
            role: 'admin',
        });

        return Response.json({
            success: true,
            token,
            expiresIn: 86400, // 24 hours
            user: {
                id: admin.id,
                username: admin.username,
            },
        });
    } catch (error) {
        console.error('Login API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
