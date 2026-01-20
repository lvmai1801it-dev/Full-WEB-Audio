import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

interface GenreRow extends RowDataPacket {
    id: string; // UUID
    name: string;
    slug: string;
    count: number;
}

// GET /api/genres - Get all genres with book counts
export async function GET() {
    try {
        const [genres] = await pool.query<GenreRow[]>(
            `SELECT 
                g.uuid as id, g.name, g.slug,
                COUNT(bg.book_id) as count
            FROM genres g
            LEFT JOIN book_genres bg ON g.id = bg.genre_id
            LEFT JOIN books b ON bg.book_id = b.id AND b.is_published = 1
            GROUP BY g.id, g.name, g.slug
            HAVING count > 0
            ORDER BY count DESC`
        );

        // Genres change rarely, cache for 5 minutes
        return new Response(JSON.stringify(
            genres.map((g: GenreRow) => ({
                id: g.id,
                name: g.name,
                slug: g.slug,
                book_count: g.count,
            }))
        ), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Genres API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
