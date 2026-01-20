"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

interface BookCardProps {
    book: Book;
    className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
    return (
        <div className={cn("group relative", className)}>
            <Link href={`/book/${book.slug}`} className="block">
                {/* Square Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#231b2e]">
                    {book?.thumbnail_url ? (
                        <Image
                            src={book.thumbnail_url}
                            alt={book.title}
                            fill
                            className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            unoptimized
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : null}

                    {/* Fallback Icon */}
                    <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-[#9b4de0]/20 to-[#e95288]/20">
                        <BookOpen className="h-12 w-12 text-white/30" />
                    </div>

                    {/* Hover Overlay with Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="h-5 w-5 text-[#170f23] fill-current ml-0.5" />
                        </div>
                    </div>

                    {/* Chapters Badge */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {book.total_chapters} chương
                    </div>
                </div>

                {/* Text Content */}
                <div className="mt-3 space-y-1">
                    <h3 className="font-semibold text-sm leading-tight text-white line-clamp-2 group-hover:text-[#9b4de0] transition-colors">
                        {book.title}
                    </h3>
                    {book.author_name && (
                        <p className="text-xs text-white/50 line-clamp-1 hover:text-[#9b4de0] hover:underline cursor-pointer">
                            {book.author_name}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
}

// Skeleton version
export function BookCardSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="aspect-square w-full rounded-lg bg-white/10" />
            <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
        </div>
    );
}
