import { NextRequest } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

interface BookRow extends RowDataPacket {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string;
    source_url: string;
    total_chapters: number;
    view_count: number;
    is_published: number;
    created_at: Date;
    updated_at: Date;
    author_name: string;
    author_slug: string;
}

interface GenreRow extends RowDataPacket {
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

// GET /api/books/[slug] - Get single book by slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get book with author
        const [books] = await pool.query<BookRow[]>(
            `SELECT 
                b.id, b.title, b.slug, b.description, b.thumbnail_url, b.source_url,
                b.total_chapters, b.view_count, b.is_published, b.created_at, b.updated_at,
                a.name as author_name, a.slug as author_slug
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE b.slug = ? AND b.is_published = 1
            LIMIT 1`,
            [slug]
        );

        if (books.length === 0) {
            return Response.json({ error: 'Book not found' }, { status: 404 });
        }

        const book = books[0];

        // Increment view count
        await pool.query('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [book.id]);

        // Get genres
        const [genres] = await pool.query<GenreRow[]>(
            `SELECT g.name, g.slug
            FROM genres g
            JOIN book_genres bg ON g.id = bg.genre_id
            WHERE bg.book_id = ?`,
            [book.id]
        );

        // Get chapters
        const [chapters] = await pool.query<ChapterRow[]>(
            `SELECT id, title, chapter_index, audio_url, duration_seconds
            FROM chapters
            WHERE book_id = ?
            ORDER BY chapter_index ASC`,
            [book.id]
        );

        return Response.json({
            id: book.id,
            title: book.title,
            slug: book.slug,
            description: book.description,
            author: {
                name: book.author_name || 'Unknown',
                slug: book.author_slug || 'unknown',
            },
            genres: genres.map((g: GenreRow) => ({ name: g.name, slug: g.slug })),
            thumbnailUrl: book.thumbnail_url,
            sourceUrl: book.source_url,
            totalChapters: book.total_chapters,
            viewCount: book.view_count + 1,
            isPublished: book.is_published === 1,
            createdAt: book.created_at,
            updatedAt: book.updated_at,
            chapters: chapters.map((c: ChapterRow) => ({
                id: c.id,
                title: c.title,
                chapterIndex: c.chapter_index,
                audioUrl: c.audio_url,
                durationSeconds: c.duration_seconds,
            })),
        });
    } catch (error) {
        console.error('Book detail API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
