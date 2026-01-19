"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Tag, ArrowLeft } from "lucide-react";
import { BookCard, BookCardSkeleton } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { getBooks, getGenres } from "@/lib/api";
import type { Book, Genre } from "@/types";
import { Pagination } from "@/components/Pagination";

export default function GenrePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [books, setBooks] = React.useState<Book[]>([]);
    const [genres, setGenres] = React.useState<Genre[]>([]);
    const [currentGenre, setCurrentGenre] = React.useState<Genre | null>(null);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Fetch genres
    React.useEffect(() => {
        getGenres().then(setGenres).catch(console.error);
    }, []);

    // Find current genre
    React.useEffect(() => {
        const genre = genres.find((g) => g.slug === slug);
        setCurrentGenre(genre || null);
    }, [genres, slug]);

    // Fetch books for this genre
    React.useEffect(() => {
        async function fetchBooks() {
            try {
                setIsLoading(true);
                const res = await getBooks({ genre: slug, page, limit: 24 });
                setBooks(res.data);
                setTotalPages(res.pagination.totalPages);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
            } finally {
                setIsLoading(false);
            }
        }
        fetchBooks();
    }, [slug, page]);

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="border-b border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="container mx-auto px-4">
                    <Link
                        href="/"
                        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-orange-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Trang chủ
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
                            <Tag className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold md:text-3xl">
                                {currentGenre?.name || slug}
                            </h1>
                            {currentGenre?.book_count !== undefined && (
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    {currentGenre.book_count} truyện
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Other genres */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {genres.map((genre) => (
                            <Link key={genre.id} href={`/genre/${genre.slug}`}>
                                <Button
                                    variant={genre.slug === slug ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full"
                                >
                                    {genre.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Books grid */}
            <div className="container mx-auto px-4 py-8">
                {error ? (
                    <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-950/50">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {isLoading
                                ? Array.from({ length: 24 }).map((_, i) => (
                                    <BookCardSkeleton key={i} />
                                ))
                                : books.map((book) => <BookCard key={book.id} book={book} />)}
                        </div>

                        {/* Empty state */}
                        {!isLoading && books.length === 0 && (
                            <div className="py-16 text-center">
                                <Tag className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                                <h2 className="mt-4 text-xl font-semibold">Chưa có truyện</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Thể loại này chưa có truyện nào.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-8">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(p) => {
                                    setPage(p);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
