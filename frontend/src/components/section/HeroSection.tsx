"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/usePlayer";
import type { Book } from "@/types";

interface HeroSectionProps {
    book?: Book;
    isLoading?: boolean;
}

export function HeroSection({ book, isLoading }: HeroSectionProps) {
    const { play, currentBook } = usePlayer();

    if (isLoading) {
        return (
            <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-[#231b2e] animate-pulse mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9b4de0]/10 to-[#e95288]/10" />
            </div>
        );
    }

    if (!book) return null;

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3d155f] via-[#5a2d82] to-[#e95288] mb-10">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#9b4de0] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#e95288] rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
            </div>

            {/* Background Image with Blur */}
            {book.thumbnail_url && (
                <>
                    <div className="absolute inset-0 z-0 opacity-20 blur-2xl scale-110">
                        <Image
                            src={book.thumbnail_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#170f23]/90 via-transparent to-transparent" />
                </>
            )}

            <div className="relative z-20 flex h-[280px] items-center p-8">
                {/* Book Cover */}
                <div className="mr-8 shrink-0 hidden md:block">
                    <div className="relative h-48 w-36 overflow-hidden rounded-lg shadow-2xl shadow-black/50 transition-transform hover:scale-105">
                        {book.thumbnail_url ? (
                            <Image
                                src={book.thumbnail_url}
                                alt={book.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#231b2e]">
                                <Headphones className="h-12 w-12 text-white/30" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                            Nổi bật
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-white md:text-4xl line-clamp-2">
                        {book.title}
                    </h1>

                    <div className="flex items-center gap-3 text-sm text-white/70">
                        <span className="font-medium text-white">{book.author_name || "Chưa rõ tác giả"}</span>
                        <span>•</span>
                        <span>{book.total_chapters} chương</span>
                    </div>

                    <p className="line-clamp-2 max-w-xl text-sm text-white/60">
                        {book.description || "Không có mô tả."}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                        <Link href={`/book/${book.slug}`}>
                            <Button size="lg" className="rounded-full bg-[#9b4de0] hover:bg-[#8b3dd0] px-8 h-11 font-semibold shadow-lg shadow-[#9b4de0]/30 btn-glow">
                                <Play className="mr-2 h-5 w-5 fill-current" />
                                Nghe ngay
                            </Button>
                        </Link>
                        <Link href={`/book/${book.slug}`}>
                            <Button variant="outline" size="lg" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11 px-6">
                                Chi tiết
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
