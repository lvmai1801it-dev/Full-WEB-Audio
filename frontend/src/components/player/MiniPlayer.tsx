"use client";

import Image from "next/image";
import { Play, Pause, SkipForward, SkipBack, Volume2, ListMusic, Headphones, Moon, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { usePlayer } from "@/hooks/usePlayer";
import { formatDuration } from "@/lib/utils";

interface MiniPlayerProps {
    onOpenFull: () => void;
}

export function MiniPlayer({ onOpenFull }: MiniPlayerProps) {
    const {
        currentTrack,
        currentBook,
        isPlaying,
        togglePlay,
        next,
        prev,
        currentTime,
        duration,
        seek,
        volume,
        setVolume,
        speed,
        setSpeed,
        sleepTimer,
        setSleepTimer
    } = usePlayer();

    if (!currentTrack || !currentBook) return null;

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-[90px] glass border-t border-white/10">
            {/* Progress Bar - Top Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seek(percent * duration);
            }}>
                <div
                    className="h-full bg-[#9b4de0] transition-all duration-100"
                    style={{ width: `${progressPercent}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                />
            </div>

            <div className="h-full flex items-center px-5 gap-4">
                {/* Left: Track Info */}
                <div
                    className="flex items-center gap-3 w-[280px] shrink-0 cursor-pointer"
                    onClick={onOpenFull}
                >
                    {/* Rotating Disc */}
                    <div className={`relative h-12 w-12 shrink-0 rounded-full overflow-hidden border-2 border-white/20 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                        {currentBook.thumbnail_url ? (
                            <Image
                                src={currentBook.thumbnail_url}
                                alt={currentBook.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#9b4de0] to-[#e95288]">
                                <Headphones className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                            {currentTrack.title}
                        </p>
                        <p className="truncate text-xs text-white/50">
                            {currentBook.author_name || currentBook.title}
                        </p>
                    </div>
                </div>

                {/* Center: Controls */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prev}
                            className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <SkipBack className="h-5 w-5 fill-current" />
                        </Button>

                        <Button
                            size="icon"
                            onClick={togglePlay}
                            className="h-10 w-10 rounded-full bg-white text-[#170f23] hover:bg-white/90 hover:scale-105 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause className="h-5 w-5 fill-current" />
                            ) : (
                                <Play className="h-5 w-5 fill-current ml-0.5" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={next}
                            className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <SkipForward className="h-5 w-5 fill-current" />
                        </Button>
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center gap-2 text-[11px] text-white/50 mt-1">
                        <span>{formatDuration(currentTime)}</span>
                        <span>/</span>
                        <span>{formatDuration(duration)}</span>
                    </div>
                </div>

                {/* Right: Speed, Timer, Volume & Queue */}
                <div className="flex items-center gap-2 w-[320px] justify-end shrink-0">
                    {/* Speed Control */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold"
                            >
                                <Gauge className="h-4 w-4 mr-1" />
                                {speed}x
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#231b2e] border-white/10 text-white min-w-[100px]">
                            <DropdownMenuLabel className="text-white/50">Tốc độ đọc</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => (
                                <DropdownMenuItem
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    className={`hover:bg-white/10 cursor-pointer ${speed === s ? 'text-[#9b4de0]' : ''}`}
                                >
                                    {s}x {speed === s && '✓'}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sleep Timer */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-2 hover:bg-white/10 text-xs font-semibold ${sleepTimer ? 'text-[#9b4de0]' : 'text-white/60 hover:text-white'}`}
                            >
                                <Moon className="h-4 w-4 mr-1" />
                                {sleepTimer ? `${sleepTimer}p` : "Hẹn giờ"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#231b2e] border-white/10 text-white min-w-[120px]">
                            <DropdownMenuLabel className="text-white/50">Hẹn giờ tắt</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {[15, 30, 45, 60, 90].map(m => (
                                <DropdownMenuItem
                                    key={m}
                                    onClick={() => setSleepTimer(m)}
                                    className={`hover:bg-white/10 cursor-pointer ${sleepTimer === m ? 'text-[#9b4de0]' : ''}`}
                                >
                                    {m} phút {sleepTimer === m && '✓'}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => setSleepTimer(null)} className="hover:bg-white/10 cursor-pointer text-white/50">
                                Tắt hẹn giờ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Queue Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                        onClick={onOpenFull}
                    >
                        <ListMusic className="h-4 w-4" />
                    </Button>

                    {/* Volume */}
                    <div className="flex items-center gap-2 w-28">
                        <Volume2 className="h-4 w-4 text-white/50 shrink-0" />
                        <Slider
                            value={volume * 100}
                            max={100}
                            step={1}
                            onChange={(val) => setVolume(val / 100)}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
