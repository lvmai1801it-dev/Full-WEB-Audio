import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

interface BookRow extends RowDataPacket {
    id: number;
    title: string;
    slug: string;
    thumbnail_url: string;
    total_chapters: number;
    is_published: number;
    created_at: Date;
    author_name: string;
}

// Helper to create slug from Vietnamese text
function createSlug(text: string): string {
    const vietnamese = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
    const ascii = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';

    let slug = text.toLowerCase();
    for (let i = 0; i < vietnamese.length; i++) {
        slug = slug.replace(new RegExp(vietnamese[i], 'g'), ascii[i]);
    }
    return slug
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-|-$/g, '');
}

// GET /api/admin/books - List all books (admin)
export async function GET(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = (page - 1) * limit;
        const q = searchParams.get('q') || '';

        let whereClause = '1=1';
        const params: (string | number)[] = [];

        if (q) {
            whereClause += ' AND (b.title LIKE ? OR a.name LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }

        const [books] = await pool.query<BookRow[]>(
            `SELECT 
                b.id, b.title, b.slug, b.thumbnail_url, b.total_chapters,
                b.is_published, b.created_at, a.name as author_name
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const [countResult] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE ${whereClause}`,
            params
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
                is_published: book.is_published === 1,
                created_at: book.created_at,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin books API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/books - Create book with chapters
export async function POST(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const body = await request.json();

        if (!body.title) {
            return Response.json({ error: 'Title is required' }, { status: 400 });
        }

        const slug = createSlug(body.title);

        // Check if exists
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM books WHERE slug = ?',
            [slug]
        );
        if (existing.length > 0) {
            return Response.json({ error: 'Book already exists' }, { status: 409 });
        }

        // Get or create author
        let authorId: number | null = null;
        if (body.author) {
            const authorSlug = createSlug(body.author);
            const [authors] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM authors WHERE slug = ?',
                [authorSlug]
            );
            if (authors.length > 0) {
                authorId = authors[0].id;
            } else {
                const authorUuid = randomUUID();
                const [result] = await pool.query<ResultSetHeader>(
                    'INSERT INTO authors (uuid, name, slug) VALUES (?, ?, ?)',
                    [authorUuid, body.author, authorSlug]
                );
                authorId = result.insertId;
            }
        }

        // Calculate total chapters
        const totalChapters = body.chapters?.length || 0;

        // Generate UUID for public access
        const uuid = randomUUID();

        // Insert book with UUID
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO books (uuid, author_id, title, slug, description, thumbnail_url, source_url, total_chapters, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [uuid, authorId, body.title, slug, body.description || null, body.thumbnailUrl || null, body.sourceUrl || null, totalChapters]
        );

        const bookId = result.insertId;

        // Insert chapters if provided
        if (body.chapters && body.chapters.length > 0) {
            for (const chapter of body.chapters) {
                const chapterUuid = randomUUID();
                await pool.query<ResultSetHeader>(
                    `INSERT INTO chapters (uuid, book_id, chapter_index, title, audio_url)
                    VALUES (?, ?, ?, ?, ?)`,
                    [chapterUuid, bookId, chapter.index, chapter.title, chapter.audioUrl]
                );
            }
        }

        // Handle genres if provided
        if (body.genres && body.genres.length > 0) {
            for (const genreName of body.genres) {
                const genreSlug = createSlug(genreName);

                // Get or create genre
                const [genres] = await pool.query<RowDataPacket[]>(
                    'SELECT id FROM genres WHERE slug = ?',
                    [genreSlug]
                );

                let genreId: number;
                if (genres.length > 0) {
                    genreId = genres[0].id;
                } else {
                    const genreUuid = randomUUID();
                    const [genreResult] = await pool.query<ResultSetHeader>(
                        'INSERT INTO genres (uuid, name, slug) VALUES (?, ?, ?)',
                        [genreUuid, genreName, genreSlug]
                    );
                    genreId = genreResult.insertId;
                }

                // Link book to genre
                await pool.query(
                    'INSERT IGNORE INTO book_genres (book_id, genre_id) VALUES (?, ?)',
                    [bookId, genreId]
                );
            }
        }

        return Response.json({
            success: true,
            id: uuid,  // Return UUID instead of numeric id
            slug,
            chaptersAdded: totalChapters
        }, { status: 201 });
    } catch (error) {
        console.error('Create book API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/books - Update book
export async function PUT(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return Response.json({ error: 'Book ID is required' }, { status: 400 });
        }

        const body = await request.json();

        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (body.title !== undefined) {
            updates.push('title = ?');
            params.push(body.title);
        }
        if (body.description !== undefined) {
            updates.push('description = ?');
            params.push(body.description);
        }
        if (body.thumbnailUrl !== undefined) {
            updates.push('thumbnail_url = ?');
            params.push(body.thumbnailUrl);
        }
        if (body.isPublished !== undefined || body.is_published !== undefined) {
            updates.push('is_published = ?');
            params.push((body.isPublished ?? body.is_published) ? 1 : 0);
        }

        if (updates.length === 0) {
            return Response.json({ error: 'No fields to update' }, { status: 400 });
        }

        // params.push(parseInt(id)); // Old logic
        params.push(id); // UUID
        await pool.query(
            `UPDATE books SET ${updates.join(', ')} WHERE uuid = ?`,
            params
        );

        return Response.json({ success: true });
    } catch (error) {
        console.error('Update book API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/books - Delete book
export async function DELETE(request: NextRequest) {
    const payload = verifyAuth(request);
    if (!payload) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return Response.json({ error: 'Book ID is required' }, { status: 400 });
        }

        // Lookup internal ID from UUID
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM books WHERE uuid = ?',
            [id]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Book not found' }, { status: 404 });
        }

        const bookId = rows[0].id;

        // Delete chapters first (FK constraint)
        await pool.query('DELETE FROM chapters WHERE book_id = ?', [bookId]);
        // Delete book_genres
        await pool.query('DELETE FROM book_genres WHERE book_id = ?', [bookId]);
        // Delete book
        await pool.query('DELETE FROM books WHERE id = ?', [bookId]);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete book API error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
