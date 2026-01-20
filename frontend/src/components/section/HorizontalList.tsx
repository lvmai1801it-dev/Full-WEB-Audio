"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookCard, BookCardSkeleton } from "@/components/BookCard";
import type { Book } from "@/types";

interface HorizontalListProps {
    title: string;
    href?: string;
    books?: Book[];
    isLoading?: boolean;
}

export function HorizontalList({ title, href, books, isLoading }: HorizontalListProps) {
    // Don't render if no books and not loading
    if (!isLoading && (!books || books.length === 0)) {
        return null;
    }

    return (
        <section className="mb-10">
            {/* Section Header - Zing Style */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">
                    {title}
                </h2>
                {href && (
                    <Link
                        href={href}
                        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-white/50 hover:text-[#9b4de0] transition-colors"
                    >
                        Tất cả
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            {/* Cards Grid - Horizontal Scroll */}
            <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-2 -mx-2 px-2">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-[180px] shrink-0">
                            <BookCardSkeleton />
                        </div>
                    ))
                ) : (
                    books?.map((book, index) => (
                        <div key={book.id || book.slug || index} className="w-[180px] shrink-0">
                            <BookCard book={book} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
