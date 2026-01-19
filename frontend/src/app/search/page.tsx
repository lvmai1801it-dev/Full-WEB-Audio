"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, ArrowLeft, BookOpen } from "lucide-react";
import { BookCard, BookCardSkeleton } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchBooks } from "@/lib/api";
import type { Book } from "@/types";
import { Pagination } from "@/components/Pagination";

const SearchContent = dynamic(() => Promise.resolve(SearchContentComponent), {
    ssr: false,
    loading: () => <SearchFallback />,
});

function SearchContentComponent() {
    const searchParams = useSearchParams();
    const [query, setQuery] = React.useState("");
    const [searchTerm, setSearchTerm] = React.useState("");
    const [results, setResults] = React.useState<Book[]>([]);
    const [pagination, setPagination] = React.useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    // Initialize search from URL on mount and update when URL changes
    React.useEffect(() => {
        const q = searchParams.get("q");
        const page = parseInt(searchParams.get("page") || "1");

        if (q) {
            setQuery(q);
            performSearch(q, page);
        } else {
            // Reset if no query
            setQuery("");
            setSearchTerm("");
            setResults([]);
            setHasSearched(false);
        }
    }, [searchParams]);

    async function performSearch(term: string, page: number = 1) {
        const trimmed = term.trim();
        if (!trimmed || trimmed.length < 2) return;

        setIsLoading(true);
        setSearchTerm(trimmed);
        setHasSearched(true);

        try {
            const res = await searchBooks(trimmed, page);
            setResults(res.data);
            if (res.pagination) {
                setPagination(res.pagination);
            }
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        // Just push to URL, allow useEffect to handle search
        const encodedQuery = encodeURIComponent(query.trim());
        if (encodedQuery) {
            window.location.href = `/search?q=${encodedQuery}`;
        }
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Search header */}
            <div className="border-b border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="container mx-auto px-4">
                    <Link
                        href="/"
                        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-orange-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Trang chủ
                    </Link>

                    <h1 className="mb-4 text-2xl font-bold md:text-3xl">Tìm kiếm truyện</h1>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                type="search"
                                placeholder="Nhập tên truyện, tác giả..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 h-12 text-base"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={isLoading}>
                            Tìm kiếm
                        </Button>
                    </form>
                </div>
            </div>


            {/* Results */}
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <BookCardSkeleton key={i} />
                        ))}
                    </div>
                ) : hasSearched ? (
                    <>
                        <p className="mb-4 text-zinc-500 dark:text-zinc-400">
                            {results.length > 0
                                ? `Tìm thấy ${pagination.total} kết quả cho "${searchTerm}"`
                                : `Không tìm thấy kết quả nào cho "${searchTerm}"`}
                        </p>

                        {results.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-8">
                                    {results.map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>

                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={(p) => {
                                        const encodedQuery = encodeURIComponent(query.trim());
                                        window.location.href = `/search?q=${encodedQuery}&page=${p}`;
                                    }}
                                />
                            </>
                        ) : (
                            <div className="py-16 text-center">
                                <BookOpen className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                                <h2 className="mt-4 text-xl font-semibold">Không có kết quả</h2>
                                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                                    Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <Search className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                        <h2 className="mt-4 text-xl font-semibold">Tìm kiếm truyện</h2>
                        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                            Nhập tên truyện hoặc tác giả để bắt đầu tìm kiếm.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SearchFallback() {
    return (
        <div className="min-h-screen pb-24">
            <div className="border-b border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="container mx-auto px-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 mb-4" />
                    <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 mb-4" />
                    <div className="h-12 w-full animate-pulse rounded bg-zinc-200" />
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <BookCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchFallback />}>
            <SearchContent />
        </Suspense>
    );
}
