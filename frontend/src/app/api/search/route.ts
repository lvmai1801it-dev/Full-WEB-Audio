import { NextRequest } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

interface BookRow extends RowDataPacket {
    id: string; // UUID
    title: string;
    slug: string;
    thumbnail_url: string;
    total_chapters: number;
    author_name: string;
}

// GET /api/search?q=xxx - Search books
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = (page - 1) * limit;

        if (!query.trim()) {
            return Response.json({
                data: [],
                pagination: { page: 1, limit, total: 0, totalPages: 0 },
            });
        }

        const searchTerm = `%${query}%`;

        // Search using LIKE (or FULLTEXT if available)
        const [books] = await pool.query<BookRow[]>(
            `SELECT 
                b.uuid as id, b.title, b.slug, b.thumbnail_url, b.total_chapters,
                a.name as author_name
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE b.is_published = 1 
                AND (b.title LIKE ? OR a.name LIKE ? OR b.description LIKE ?)
            ORDER BY b.view_count DESC
            LIMIT ? OFFSET ?`,
            [searchTerm, searchTerm, searchTerm, limit, offset]
        );

        // Get total count
        const [countResult] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE b.is_published = 1 
                AND (b.title LIKE ? OR a.name LIKE ? OR b.description LIKE ?)`,
            [searchTerm, searchTerm, searchTerm]
        );
        const total = countResult[0]?.total || 0;

        return Response.json({
            data: books.map((book: BookRow) => ({
                id: book.id,
                title: book.title,
                slug: book.slug,
                author_name: book.author_name,
                thumbnail_url: book.thumbnail_url,
                total_chapters: book.total_chapters,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Search API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
