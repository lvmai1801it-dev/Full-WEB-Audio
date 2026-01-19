import { NextRequest } from 'next/server';
import pool from '@/lib/mysql';
import { ResultSetHeader } from 'mysql2';

// POST /api/chapters/update-duration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { chapter_id, duration } = body;

        if (!chapter_id || !duration) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update duration
        await pool.query<ResultSetHeader>(
            'UPDATE chapters SET duration_seconds = ? WHERE uuid = ?', // Using UUID since frontend sends ID which is now UUID
            [duration, chapter_id]
        );

        return Response.json({ success: true });
    } catch (error) {
        console.error('Update duration error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
