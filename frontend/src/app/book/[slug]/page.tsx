"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Play,
    BookOpen,
    Eye,
    Clock,
    User,
    Tag,
    Heart,
    Share2,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChapterList } from "@/components/ChapterList";
import { getBook } from "@/lib/api";
import { formatViewCount, formatDuration } from "@/lib/utils";
import { usePlayer } from "@/hooks/usePlayer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Book, BookProgress } from "@/types";

export default function BookDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [book, setBook] = React.useState<Book | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [savedProgress, setSavedProgress] = React.useState<BookProgress | null>(null);

    const { play, currentBook, isPlaying, currentTrack, seek } = usePlayer();
    const { getProgress, isFavorite, toggleFavorite, isLoaded } = useLocalStorage();

    React.useEffect(() => {
        async function fetchBook() {
            try {
                setIsLoading(true);
                const data = await getBook(slug);
                setBook(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Không tìm thấy truyện");
            } finally {
                setIsLoading(false);
            }
        }
        fetchBook();
    }, [slug]);

    // Load saved progress after localStorage is ready
    React.useEffect(() => {
        if (isLoaded && book) {
            const progress = getProgress(book.slug);
            setSavedProgress(progress);
            console.log('[Resume] Loaded progress for', book.slug, ':', progress);
        }
    }, [isLoaded, book, getProgress]);

    const isCurrentBook = currentBook?.slug === book?.slug;
    const favorite = book ? isFavorite(book.slug) : false;

    const handlePlay = () => {
        if (!book || !book.chapters || book.chapters.length === 0) return;

        // Find chapter to start from
        let startIndex = 0;
        let startTime = 0;

        if (savedProgress) {
            const savedIndex = book.chapters.findIndex(
                (ch) => ch.chapter_index === savedProgress.chapterIndex
            );
            if (savedIndex >= 0) {
                startIndex = savedIndex;
                startTime = savedProgress.position;
            }
            console.log('[Resume] Starting from chapter', startIndex, 'at', startTime, 'seconds');
        }

        const chapter = book.chapters[startIndex];
        play(chapter, book, book.chapters);

        // Seek to saved position after audio is ready
        if (startTime > 0) {
            const attemptSeek = (attempts = 0) => {
                const audio = document.querySelector("audio") as HTMLAudioElement;
                if (audio && audio.readyState >= 1) {
                    audio.currentTime = startTime;
                    console.log('[Resume] Seeked to', startTime);
                } else if (attempts < 20) {
                    // Retry up to 20 times (2 seconds total)
                    setTimeout(() => attemptSeek(attempts + 1), 100);
                }
            };
            attemptSeek();
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: book?.title,
                    text: book?.description,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) {
        return <BookDetailSkeleton />;
    }

    if (error || !book) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                <h1 className="mt-4 text-2xl font-bold">Không tìm thấy truyện</h1>
                <p className="mt-2 text-zinc-500">{error || "Truyện không tồn tại hoặc đã bị xóa."}</p>
                <Link href="/">
                    <Button className="mt-6">Về trang chủ</Button>
                </Link>
            </div>
        );
    }

    const totalDuration = book.chapters?.reduce(
        (acc, ch) => acc + ch.duration_seconds,
        0
    ) || 0;

    return (
        <div className="min-h-screen pb-24">
            {/* Hero */}
            <div className="relative bg-gradient-to-b from-zinc-100 to-white py-8 dark:from-zinc-900 dark:to-zinc-950">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {/* Thumbnail */}
                        <div className="shrink-0 mx-auto md:mx-0">
                            <div className="relative h-80 w-60 overflow-hidden rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-800">
                                {book.thumbnail_url && (
                                    <Image
                                        src={book.thumbnail_url}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        unoptimized
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                                {/* Fallback placeholder */}
                                <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-zinc-400" />
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold md:text-4xl">{book.title}</h1>

                            {/* Author */}
                            {book.author_name && (
                                <Link
                                    href={`/author/${book.author_slug}`}
                                    className="mt-2 inline-flex items-center gap-2 text-lg text-zinc-600 hover:text-orange-500 dark:text-zinc-400"
                                >
                                    <User className="h-5 w-5" />
                                    {book.author_name}
                                </Link>
                            )}

                            {/* Genres */}
                            {book.genres && book.genres.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {book.genres.map((genre) => (
                                        <Link
                                            key={genre.id}
                                            href={`/genre/${genre.slug}`}
                                            className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-300"
                                        >
                                            <Tag className="h-3 w-3" />
                                            {genre.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {formatViewCount(book.view_count)} lượt nghe
                                </span>
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {book.total_chapters || book.chapters?.length || 0} chương
                                </span>
                                {totalDuration > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {formatDuration(totalDuration)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {book.description && (
                                <p className="mt-4 text-zinc-600 dark:text-zinc-400 line-clamp-3 md:line-clamp-none">
                                    {book.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button size="lg" onClick={handlePlay} className="gap-2">
                                    {savedProgress ? (
                                        <>
                                            <RotateCcw className="h-5 w-5" />
                                            Tiếp tục nghe
                                            <span className="text-xs opacity-75">
                                                (Ch.{savedProgress.chapterIndex})
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5 fill-current" />
                                            Nghe từ đầu
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant={favorite ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => toggleFavorite(book.slug)}
                                    className="gap-2"
                                >
                                    <Heart
                                        className={`h-5 w-5 ${favorite ? "fill-current" : ""}`}
                                    />
                                    {favorite ? "Đã thích" : "Yêu thích"}
                                </Button>

                                <Button variant="outline" size="lg" onClick={handleShare}>
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Resume info */}
                            {savedProgress && (
                                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                                    Lần nghe gần nhất: Chương {savedProgress.chapterIndex} - {formatDuration(savedProgress.position)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter list */}
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6">
                    <h2 className="mb-4 text-xl font-bold">
                        Danh sách chương ({book.chapters?.length || 0})
                    </h2>
                    {book.chapters && book.chapters.length > 0 ? (
                        <ChapterList book={book} chapters={book.chapters} />
                    ) : (
                        <p className="text-center text-zinc-500 dark:text-zinc-400">
                            Chưa có chương nào.
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}

function BookDetailSkeleton() {
    return (
        <div className="min-h-screen">
            <div className="bg-gradient-to-b from-zinc-100 to-white py-8 dark:from-zinc-900 dark:to-zinc-950">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-8 md:flex-row">
                        <Skeleton className="mx-auto h-80 w-60 rounded-xl md:mx-0" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-20 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="flex gap-3">
                                <Skeleton className="h-12 w-40" />
                                <Skeleton className="h-12 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </Card>
            </div>
        </div>
    );
}
