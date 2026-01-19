"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Gauge,
    Timer,
    List,
    X,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompactChapterList } from "@/components/ChapterList";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayer } from "@/hooks/usePlayer";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_OPTIONS = [
    { label: "15 phút", value: 15 },
    { label: "30 phút", value: 30 },
    { label: "45 phút", value: 45 },
    { label: "60 phút", value: 60 },
    { label: "Hết chương này", value: -1 },
];

export function AudioPlayer() {
    const {
        isPlaying,
        currentTrack,
        currentBook,
        playlist,
        currentIndex,
        currentTime,
        duration,
        volume,
        speed,
        sleepTimer,
        sleepMode,
        togglePlay,
        next,
        prev,
        seek,
        setCurrentTime,
        setDuration,
        setVolume,
        setSpeed,
        setAudioRef,
        setSleepTimer,
        decrementSleepTimer,
    } = usePlayer();

    const { saveProgress, settings, updateSettings, isLoaded } = useLocalStorage();

    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [isMuted, setIsMuted] = React.useState(false);
    const previousVolume = React.useRef(volume);

    // Register audio element
    React.useEffect(() => {
        if (audioRef.current) {
            setAudioRef(audioRef.current);
        }
    }, [setAudioRef]);

    // Sync settings from localStorage
    React.useEffect(() => {
        if (isLoaded && settings) {
            setVolume(settings.volume);
            setSpeed(settings.speed);
        }
    }, [isLoaded, settings, setVolume, setSpeed]);

    // Save progress periodically - use ref to avoid resetting interval on every time update
    const currentTimeRef = React.useRef(currentTime);
    React.useEffect(() => {
        currentTimeRef.current = currentTime;
    }, [currentTime]);

    React.useEffect(() => {
        if (!currentBook || !currentTrack) return;

        const interval = setInterval(() => {
            const timeNow = currentTimeRef.current;
            if (timeNow > 0) {
                console.log('[AutoSave] Saving progress:', currentBook.slug, 'ch:', currentTrack.chapter_index, 'pos:', Math.floor(timeNow));
                saveProgress(currentBook.slug, {
                    chapterId: currentTrack.id,
                    chapterIndex: currentTrack.chapter_index,
                    position: Math.floor(timeNow),
                    updatedAt: new Date().toISOString(),
                });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [currentBook, currentTrack, saveProgress]);

    // Sleep timer countdown
    React.useEffect(() => {
        if (!sleepTimer || sleepMode !== "time") return;

        const interval = setInterval(() => {
            decrementSleepTimer();
        }, 60000);

        return () => clearInterval(interval);
    }, [sleepTimer, sleepMode, decrementSleepTimer]);

    // Audio event handlers
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            const audioDuration = Math.floor(audioRef.current.duration);
            setDuration(audioDuration);
            audioRef.current.volume = volume;
            audioRef.current.playbackRate = speed;

            // Update duration in database if not yet set
            if (currentTrack && currentTrack.duration_seconds === 0 && audioDuration > 0) {
                fetch('/api/chapters/update-duration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chapter_id: currentTrack.id,
                        duration: audioDuration
                    })
                }).catch(console.error);
            }
        }
    };

    const handleEnded = () => {
        next();
    };

    const handleSeek = (value: number) => {
        seek(value);
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        setIsMuted(value === 0);
        updateSettings({ volume: value });
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(previousVolume.current);
            setIsMuted(false);
        } else {
            previousVolume.current = volume;
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleSpeedChange = (newSpeed: number) => {
        setSpeed(newSpeed);
        updateSettings({ speed: newSpeed });
    };

    const handleSleepTimer = (minutes: number) => {
        if (minutes === -1) {
            setSleepTimer(1, "chapter");
        } else {
            setSleepTimer(minutes, "time");
        }
    };

    const clearSleepTimer = () => {
        setSleepTimer(null);
    };

    // Always render hidden audio element
    if (!currentTrack || !currentBook) {
        return (
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
            />
        );
    }

    return (
        <>
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
            />

            {/* Player UI - Always visible with all controls */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/95">
                <div className="container mx-auto px-4 py-3">
                    {/* Progress bar - Always visible */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-12 text-right text-xs text-zinc-500 tabular-nums">
                            {formatDuration(currentTime)}
                        </span>
                        <Slider
                            value={currentTime}
                            max={duration || 100}
                            onChange={handleSeek}
                            className="flex-1"
                        />
                        <span className="w-12 text-xs text-zinc-500 tabular-nums">
                            {formatDuration(duration)}
                        </span>
                    </div>

                    {/* Main controls row */}
                    <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <Link href={`/book/${currentBook.slug}`} className="shrink-0 hidden sm:block">
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                {currentBook.thumbnail_url && (
                                    <Image
                                        src={currentBook.thumbnail_url}
                                        alt={currentBook.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                )}
                                <div className="absolute inset-0 flex h-full items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-zinc-400" />
                                </div>
                            </div>
                        </Link>

                        {/* Track info */}
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/book/${currentBook.slug}`}
                                className="block truncate text-sm font-medium hover:text-orange-500"
                            >
                                {currentTrack.title}
                            </Link>
                            <p className="truncate text-xs text-zinc-500">{currentBook.title}</p>
                        </div>

                        {/* Playback controls */}
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={prev} className="h-9 w-9">
                                <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="default"
                                size="icon"
                                className="h-10 w-10 rounded-full"
                                onClick={togglePlay}
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5 fill-current" />
                                ) : (
                                    <Play className="h-5 w-5 fill-current" />
                                )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={next} className="h-9 w-9">
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Extra controls */}
                        <div className="flex items-center gap-1">
                            {/* Speed control */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium">
                                        {speed}x
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Tốc độ phát</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {SPEED_OPTIONS.map((s) => (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() => handleSpeedChange(s)}
                                            className={cn(speed === s && "text-orange-500 font-medium")}
                                        >
                                            {s}x {s === 1 && "(Bình thường)"}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Chapter list */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <List className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72" align="end">
                                    <DropdownMenuLabel>
                                        Chương ({currentIndex + 1}/{playlist.length})
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <CompactChapterList
                                        book={currentBook}
                                        chapters={playlist}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Sleep timer */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 relative hidden sm:flex">
                                        <Timer className="h-4 w-4" />
                                        {sleepTimer && (
                                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                                                {sleepMode === "chapter" ? "C" : sleepTimer}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Hẹn giờ tắt</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {sleepTimer ? (
                                        <>
                                            <div className="px-2 py-1.5 text-sm">
                                                {sleepMode === "chapter"
                                                    ? "Dừng sau chương này"
                                                    : `Còn ${sleepTimer} phút`}
                                            </div>
                                            <DropdownMenuItem onClick={clearSleepTimer}>
                                                <X className="mr-2 h-4 w-4" />
                                                Hủy hẹn giờ
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        SLEEP_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => handleSleepTimer(opt.value)}
                                            >
                                                {opt.label}
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Volume - desktop only */}
                            <div className="hidden lg:flex items-center gap-2 ml-2">
                                <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="h-4 w-4" />
                                    ) : (
                                        <Volume2 className="h-4 w-4" />
                                    )}
                                </Button>
                                <Slider
                                    value={volume}
                                    max={1}
                                    step={0.01}
                                    onChange={handleVolumeChange}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to prevent content from being hidden behind player */}
            <div className="h-28" />
        </>
    );
}
