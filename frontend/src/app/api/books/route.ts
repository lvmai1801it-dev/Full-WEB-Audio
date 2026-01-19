import { NextRequest } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

interface BookRow extends RowDataPacket {
    id: number;
    uuid: string; // Add UUID field from query
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string;
    total_chapters: number;
    view_count: number;
    is_published: number;
    created_at: Date;
    author_name: string;
    author_slug: string;
}

interface GenreRow extends RowDataPacket {
    id: string; // UUID
    name: string;
    slug: string;
}

interface ChapterRow extends RowDataPacket {
    id: number;
    title: string;
    chapter_index: number;
    audio_url: string;
    duration_seconds: number;
}

// GET /api/books - List all books with pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = (page - 1) * limit;
        const genre = searchParams.get('genre');
        const sort = searchParams.get('sort') || 'latest';

        // Build query
        let whereClause = 'WHERE b.is_published = 1';
        const params: (string | number)[] = [];

        if (genre) {
            whereClause += ` AND EXISTS (
                SELECT 1 FROM book_genres bg
                JOIN genres g ON bg.genre_id = g.id
                WHERE bg.book_id = b.id AND g.slug = ?
            )`;
            params.push(genre);
        }

        // Sort options
        let orderBy = 'ORDER BY b.created_at DESC';
        if (sort === 'popular') {
            orderBy = 'ORDER BY b.view_count DESC';
        } else if (sort === 'name') {
            orderBy = 'ORDER BY b.title ASC';
        }

        // Get books with author
        const [books] = await pool.query<BookRow[]>(
            `SELECT 
                b.uuid as id, b.title, b.slug, b.description, b.thumbnail_url,
                b.total_chapters, b.view_count, b.is_published, b.created_at,
                a.name as author_name, a.slug as author_slug
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            ${whereClause}
            ${orderBy}
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Get total count
        const [countResult] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total FROM books b ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        // Get genres for each book
        const booksWithGenres = await Promise.all(
            books.map(async (book: BookRow) => {
                const [genres] = await pool.query<GenreRow[]>(
                    `SELECT g.uuid as id, g.name, g.slug
                    FROM genres g
                    JOIN book_genres bg ON g.id = bg.genre_id
                    WHERE bg.book_id = (SELECT id FROM books WHERE uuid = ?)`,
                    [book.id]
                );

                return {
                    id: book.id, // Now UUID string
                    title: book.title,
                    slug: book.slug,
                    author: {
                        id: "", // TODO: need author UUID from query if needed
                        name: book.author_name || 'Unknown',
                        slug: book.author_slug || 'unknown',
                    },
                    genres: genres.map((g: GenreRow) => ({ id: g.id, name: g.name, slug: g.slug })),
                    thumbnailUrl: book.thumbnail_url,
                    totalChapters: book.total_chapters,
                    viewCount: book.view_count,
                    createdAt: book.created_at,
                };
            })
        );

        return Response.json({
            data: booksWithGenres,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Books API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
