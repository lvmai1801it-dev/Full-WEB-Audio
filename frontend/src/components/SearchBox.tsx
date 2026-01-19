"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce, useOnClickOutside } from "@/lib/hooks";
import { searchBooks } from "@/lib/api";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
    className?: string;
    onClose?: () => void; // Called when search is completed (e.g. for mobile menu)
    autoFocus?: boolean;
}

export function SearchBox({ className, onClose, autoFocus }: SearchBoxProps) {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<Book[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(containerRef, () => setShowResults(false));

    React.useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                // Limit to 5 results for live search
                const res = await searchBooks(debouncedQuery, 1);
                // We'll take top 5 manually as API doesn't support limit param in searchBooks yet (default 20)
                setResults(res.data.slice(0, 5));
                setShowResults(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowResults(false);
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            if (onClose) onClose();
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setShowResults(false);
        // Focus input back if needed?
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <Input
                    type="search"
                    placeholder="Tìm truyện, tác giả..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!showResults && e.target.value.length >= 2) setShowResults(true);
                    }}
                    className="w-full pl-10 pr-10"
                    autoFocus={autoFocus}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 hover:bg-transparent"
                        onClick={clearSearch}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                        ) : (
                            <X className="h-4 w-4 text-zinc-400" />
                        )}
                    </Button>
                )}
            </form>

            {/* Live Search Results Dropdown */}
            {showResults && (query.length >= 2) && (
                <div className="absolute top-full mt-2 left-0 w-full rounded-md border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50">
                    {/* Results List */}
                    {results.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {results.map((book) => (
                                <Link
                                    key={book.id}
                                    href={`/book/${book.slug}`}
                                    className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onClick={() => {
                                        setShowResults(false);
                                        if (onClose) onClose();
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                                        {book.thumbnail_url && (
                                            <Image
                                                src={book.thumbnail_url}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        )}
                                        <BookOpen className="absolute inset-0 m-auto h-5 w-5 text-zinc-300" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="flex justify-between items-start text-sm font-medium leading-tight truncate">
                                            <span className="truncate pr-2">{book.title}</span>
                                        </h4>
                                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                                            {book.author_name || "Đang cập nhật"}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                            {book.total_chapters} chương
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800">
                                <button
                                    className="w-full rounded-md px-2 py-1.5 text-center text-sm font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-zinc-800"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSearch(e);
                                    }}
                                >
                                    Xem tất cả kết quả cho "{query}"
                                </button>
                            </div>
                        </div>
                    ) : (
                        !isLoading && (
                            <div className="py-4 text-center text-sm text-zinc-500">
                                Không tìm thấy kết quả nào.
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
