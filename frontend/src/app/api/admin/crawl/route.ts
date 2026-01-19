import { NextRequest } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

interface CrawlQueueRow extends RowDataPacket {
    id: number;
    target_url: string;
    status: 'pending' | 'processing' | 'done' | 'failed';
    error_message: string | null;
    created_at: Date;
}

// GET /api/admin/crawl - Get crawl queue
export async function GET(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

        const [queue] = await pool.query<CrawlQueueRow[]>(
            `SELECT id, target_url, status, error_message, created_at
            FROM crawl_queue
            ORDER BY created_at DESC
            LIMIT ?`,
            [limit]
        );

        return Response.json({
            data: queue.map((item: CrawlQueueRow) => ({
                id: item.id,
                url: item.target_url,
                status: item.status,
                error: item.error_message,
                createdAt: item.created_at,
            })),
        });
    } catch (error) {
        console.error('Crawl queue API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/crawl - Add URL to crawl queue
export async function POST(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return Response.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Check if URL already in queue
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM crawl_queue WHERE target_url = ? AND status IN (?, ?)',
            [url, 'pending', 'processing']
        );

        if (existing.length > 0) {
            return Response.json({
                error: 'URL already in queue',
                id: existing[0].id.toString()
            }, { status: 409 });
        }

        // Add to queue
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO crawl_queue (target_url, status) VALUES (?, ?)',
            [url, 'pending']
        );

        return Response.json({
            success: true,
            id: result.insertId.toString(),
            message: 'URL added to crawl queue',
        }, { status: 201 });
    } catch (error) {
        console.error('Add to crawl queue API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/crawl - Remove from crawl queue
export async function DELETE(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return Response.json({ error: 'ID is required' }, { status: 400 });
        }

        await pool.query('DELETE FROM crawl_queue WHERE id = ?', [parseInt(id)]);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete from crawl queue API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
