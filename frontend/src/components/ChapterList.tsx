"use client";

import { Play, Pause, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayer } from "@/hooks/usePlayer";
import type { Book, Chapter } from "@/types";

interface ChapterListProps {
    book: Book;
    chapters: Chapter[];
    className?: string;
}

export function ChapterList({ book, chapters, className }: ChapterListProps) {
    const { currentTrack, isPlaying, play, pause, resume } = usePlayer();

    const handlePlayChapter = (chapter: Chapter) => {
        if (currentTrack?.id === chapter.id) {
            if (isPlaying) {
                pause();
            } else {
                resume();
            }
        } else {
            play(chapter, book, chapters);
        }
    };

    return (
        <div className={cn("space-y-1", className)}>
            {chapters.map((chapter, index) => {
                const isCurrentTrack = currentTrack?.id === chapter.id;
                const isPlayingThis = isCurrentTrack && isPlaying;

                return (
                    <div
                        key={chapter.id}
                        className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                            isCurrentTrack
                                ? "bg-orange-50 dark:bg-orange-950/30"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        {/* Index/Play button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 shrink-0 rounded-full",
                                isCurrentTrack && "text-orange-500"
                            )}
                            onClick={() => handlePlayChapter(chapter)}
                        >
                            {isPlayingThis ? (
                                <Pause className="h-4 w-4 fill-current" />
                            ) : isCurrentTrack ? (
                                <Play className="h-4 w-4 fill-current" />
                            ) : (
                                <span className="text-sm font-medium text-zinc-500 group-hover:hidden">
                                    {chapter.chapter_index}
                                </span>
                            )}
                            {!isCurrentTrack && (
                                <Play className="hidden h-4 w-4 fill-current group-hover:block" />
                            )}
                        </Button>

                        {/* Title */}
                        <div className="min-w-0 flex-1">
                            <button
                                className={cn(
                                    "block w-full truncate text-left text-sm font-medium transition-colors hover:text-orange-500",
                                    isCurrentTrack && "text-orange-500"
                                )}
                                onClick={() => handlePlayChapter(chapter)}
                            >
                                {chapter.title}
                            </button>
                        </div>

                        {/* Duration - only show if we have it */}
                        {chapter.duration_seconds > 0 && (
                            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                                {formatDuration(chapter.duration_seconds)}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Compact chapter list for sidebar or modal
export function CompactChapterList({
    book,
    chapters,
    className,
    onChapterClick,
}: ChapterListProps & { onChapterClick?: () => void }) {
    const { currentTrack, isPlaying, play, pause, resume, goToChapter, playlist } = usePlayer();

    const handlePlayChapter = (chapter: Chapter, index: number) => {
        if (currentTrack?.id === chapter.id) {
            if (isPlaying) {
                pause();
            } else {
                resume();
            }
        } else {
            // If same book playlist, just go to chapter
            if (playlist.length > 0 && playlist[0]?.id === chapters[0]?.id) {
                goToChapter(index);
            } else {
                play(chapter, book, chapters);
            }
        }
        onChapterClick?.();
    };

    return (
        <div className={cn("max-h-80 overflow-y-auto", className)}>
            {chapters.map((chapter, index) => {
                const isCurrentTrack = currentTrack?.id === chapter.id;

                return (
                    <button
                        key={chapter.id}
                        className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                            isCurrentTrack && "bg-orange-50 text-orange-500 dark:bg-orange-950/30"
                        )}
                        onClick={() => handlePlayChapter(chapter, index)}
                    >
                        <span className="w-6 shrink-0 text-center text-xs text-zinc-400">
                            {chapter.chapter_index}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{chapter.title}</span>
                        {isCurrentTrack && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                );
            })}
        </div>
    );
}
