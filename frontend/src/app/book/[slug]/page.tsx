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
    Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

    React.useEffect(() => {
        if (isLoaded && book) {
            const progress = getProgress(book.slug);
            setSavedProgress(progress);
        }
    }, [isLoaded, book, getProgress]);

    const isCurrentBook = currentBook?.slug === book?.slug;
    const favorite = book ? isFavorite(book.slug) : false;

    const handlePlay = () => {
        if (!book || !book.chapters || book.chapters.length === 0) return;

        let startIndex = 0;
        let startTime = 0;

        if (savedProgress) {
            const savedIndex = book.chapters.findIndex(
                (ch) => ch.chapter_index === savedProgress.chapterIndex
            );
            if (savedIndex >= 0) {
                startIndex = savedIndex;
                startTime = savedProgress.position || 0;
            }
        }

        const chapter = book.chapters[startIndex];
        play(chapter, book, book.chapters);

        if (startTime > 0) {
            const attemptSeek = (attempts = 0) => {
                const audio = document.querySelector("audio") as HTMLAudioElement;
                if (audio && audio.readyState >= 1) {
                    audio.currentTime = startTime;
                } else if (attempts < 20) {
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
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) {
        return <BookDetailSkeleton />;
    }

    if (error || !book) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-10 w-10 text-white/30" />
                </div>
                <h1 className="text-xl font-bold text-white">Không tìm thấy truyện</h1>
                <p className="mt-2 text-white/50">{error || "Truyện không tồn tại hoặc đã bị xóa."}</p>
                <Link href="/">
                    <Button className="mt-6 bg-[#9b4de0] hover:bg-[#8b3dd0]">Về trang chủ</Button>
                </Link>
            </div>
        );
    }

    const totalDuration = book.chapters?.reduce((acc, ch) => acc + ch.duration_seconds, 0) || 0;

    return (
        <div className="min-h-screen pb-32">
            {/* Hero Section - Dark Gradient */}
            <div className="relative overflow-hidden">
                {/* Background Blur */}
                {book.thumbnail_url && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={book.thumbnail_url}
                            alt=""
                            fill
                            className="object-cover blur-3xl scale-110 opacity-30"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#170f23]/80 to-[#170f23]" />
                    </div>
                )}

                <div className="relative z-10 py-8">
                    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                        {/* Thumbnail */}
                        <div className="shrink-0 mx-auto md:mx-0">
                            <div className="relative h-72 w-52 overflow-hidden rounded-xl shadow-2xl shadow-black/50 bg-[#231b2e]">
                                {book.thumbnail_url ? (
                                    <Image
                                        src={book.thumbnail_url}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Headphones className="h-16 w-16 text-white/20" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-white md:text-3xl">
                                {book.title}
                            </h1>

                            {book.author_name && (
                                <Link
                                    href={`/author/${book.author_slug}`}
                                    className="mt-2 inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#9b4de0]"
                                >
                                    <User className="h-4 w-4" />
                                    {book.author_name}
                                </Link>
                            )}

                            {/* Genres */}
                            {book.genres && book.genres.length > 0 && (
                                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                                    {book.genres.map((genre) => (
                                        <Link
                                            key={genre.slug}
                                            href={`/genre/${genre.slug}`}
                                            className="inline-flex items-center gap-1 rounded-full bg-[#9b4de0]/20 px-3 py-1 text-xs font-medium text-[#9b4de0] hover:bg-[#9b4de0]/30 border border-[#9b4de0]/30"
                                        >
                                            <Tag className="h-3 w-3" />
                                            {genre.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-white/50">
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
                                <p className="mt-4 text-sm text-white/60 line-clamp-3">
                                    {book.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                                <Button
                                    size="lg"
                                    onClick={handlePlay}
                                    className="rounded-full bg-[#9b4de0] hover:bg-[#8b3dd0] px-8 h-11 font-semibold btn-glow"
                                >
                                    {savedProgress ? (
                                        <>
                                            <RotateCcw className="h-5 w-5 mr-2" />
                                            Tiếp tục nghe
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5 fill-current mr-2" />
                                            Nghe từ đầu
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => toggleFavorite(book.slug)}
                                    className={`rounded-full border-white/20 bg-white/5 h-11 px-6 ${favorite ? 'text-[#e95288] border-[#e95288]/50' : 'text-white hover:text-white'} hover:bg-white/10`}
                                >
                                    <Heart className={`h-5 w-5 mr-2 ${favorite ? "fill-current" : ""}`} />
                                    {favorite ? "Đã thích" : "Yêu thích"}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleShare}
                                    className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 h-11 w-11 text-white/70"
                                >
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>

                            {savedProgress && (
                                <p className="mt-3 text-xs text-white/40">
                                    Lần nghe gần nhất: Chương {savedProgress.chapterIndex ?? 1} - {formatDuration(savedProgress.position || 0)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter List */}
            <div className="mt-8">
                <div className="bg-[#231b2e] rounded-xl p-6 border border-white/5">
                    <h2 className="mb-4 text-lg font-bold text-white">
                        Danh sách chương ({book.chapters?.length || 0})
                    </h2>
                    {book.chapters && book.chapters.length > 0 ? (
                        <ChapterList book={book} chapters={book.chapters} />
                    ) : (
                        <p className="text-center text-white/40 py-8">
                            Chưa có chương nào.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function BookDetailSkeleton() {
    return (
        <div className="min-h-screen animate-pulse">
            <div className="py-8">
                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                    <div className="mx-auto h-72 w-52 rounded-xl bg-white/10 md:mx-0" />
                    <div className="flex-1 space-y-4">
                        <div className="h-8 w-3/4 rounded bg-white/10 mx-auto md:mx-0" />
                        <div className="h-5 w-1/4 rounded bg-white/10 mx-auto md:mx-0" />
                        <div className="flex gap-2 justify-center md:justify-start">
                            <div className="h-6 w-20 rounded-full bg-white/10" />
                            <div className="h-6 w-20 rounded-full bg-white/10" />
                        </div>
                        <div className="h-4 w-full rounded bg-white/10" />
                        <div className="flex gap-3 justify-center md:justify-start">
                            <div className="h-11 w-40 rounded-full bg-white/10" />
                            <div className="h-11 w-32 rounded-full bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-[#231b2e] rounded-xl p-6 space-y-3">
                <div className="h-6 w-48 rounded bg-white/10" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 w-full rounded bg-white/10" />
                ))}
            </div>
        </div>
    );
}
