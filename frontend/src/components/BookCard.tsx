"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Eye, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatViewCount, truncateText } from "@/lib/utils";
import type { Book } from "@/types";

interface BookCardProps {
    book: Book;
    className?: string;
    showDescription?: boolean;
}

export function BookCard({ book, className, showDescription = false }: BookCardProps) {
    return (
        <Card className={cn("group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1", className)}>
            <Link href={`/book/${book.slug}`} className="block">
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {book?.thumbnail_url ? (
                        <Image
                            src={book?.thumbnail_url}
                            alt={book?.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            unoptimized
                            onError={(e) => {
                                // Hide broken image and show placeholder
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : null}
                    {/* Fallback placeholder - always visible behind image */}
                    <div className="absolute inset-0 flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                    </div>


                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
                            <Play className="h-6 w-6 fill-current" />
                        </Button>
                    </div>

                    {/* Chapters badge */}
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {book.total_chapters} chương
                    </div>
                </div>
            </Link>

            <CardContent className="p-3">
                {/* Title */}
                <Link href={`/book/${book.slug}`}>
                    <h3 className="font-semibold leading-tight line-clamp-2 hover:text-orange-500 transition-colors">
                        {book.title}
                    </h3>
                </Link>

                {/* Author */}
                {book.author_name && (
                    <Link
                        href={`/author/${book.author_slug}`}
                        className="mt-1 block text-sm text-zinc-500 hover:text-orange-500 transition-colors dark:text-zinc-400"
                    >
                        {book.author_name}
                    </Link>
                )}

                {/* Description */}
                {showDescription && book.description && (
                    <p className="mt-2 text-sm text-zinc-600 line-clamp-2 dark:text-zinc-400">
                        {truncateText(book.description, 100)}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {formatViewCount(book.view_count)}
                    </span>

                    {/* Genres */}
                    {book.genres && book.genres.length > 0 && (
                        <span className="flex-1 truncate">
                            {book.genres.map((g) => g.name).join(", ")}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Skeleton version for loading states
export function BookCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="aspect-[3/4] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <CardContent className="p-3 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </CardContent>
        </Card>
    );
}
