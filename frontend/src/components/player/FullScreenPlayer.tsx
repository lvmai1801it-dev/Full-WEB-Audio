"use client";

import * as React from "react";
import Image from "next/image";
import {
    ChevronDown, MoreHorizontal,
    SkipBack, SkipForward, Play, Pause,
    Shuffle, Repeat, Moon, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ProgressBar } from "./ProgressBar";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";

interface FullScreenPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FullScreenPlayer({ isOpen, onClose }: FullScreenPlayerProps) {
    const {
        currentTrack,
        currentBook,
        isPlaying,
        togglePlay,
        next,
        prev,
        seek,
        currentTime,
        duration,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        speed,
        setSpeed,
        sleepTimer,
        setSleepTimer
    } = usePlayer();

    if (!isOpen || !currentTrack || !currentBook) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#3d155f] to-[#170f23] md:inset-auto md:right-4 md:bottom-[100px] md:top-auto md:left-auto md:w-[400px] md:h-[600px] md:rounded-xl md:shadow-2xl md:border md:border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
                    <ChevronDown className="h-6 w-6" />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
                        Đang phát từ thư viện
                    </span>
                    <span className="text-xs font-semibold text-white line-clamp-1">
                        {currentBook.title}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
                    <MoreHorizontal className="h-6 w-6" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col items-center justify-center p-8">
                {/* Rotating Disc Artwork */}
                <div className={cn(
                    "relative w-64 h-64 rounded-full overflow-hidden shadow-2xl shadow-black/50 border-4 border-white/10",
                    isPlaying ? "animate-spin-slow" : ""
                )}>
                    {currentBook.thumbnail_url ? (
                        <Image
                            src={currentBook.thumbnail_url}
                            alt={currentBook.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#9b4de0] to-[#e95288]">
                            <Headphones className="h-24 w-24 text-white/50" />
                        </div>
                    )}
                    {/* Center Disc Hole */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#170f23] border-4 border-white/10" />
                    </div>
                </div>

                {/* Track Info */}
                <div className="mt-8 w-full text-center">
                    <h2 className="text-xl font-bold text-white line-clamp-2">
                        {currentTrack.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                        {currentBook.author_name || "Chưa rõ tác giả"}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 w-full">
                    <ProgressBar
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={seek}
                        showTime
                    />
                </div>

                {/* Controls */}
                <div className="mt-6 flex w-full items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleShuffle}
                        className={cn("h-10 w-10 text-white/50 hover:text-white hover:bg-white/10", isShuffle && "text-[#9b4de0]")}
                    >
                        <Shuffle className="h-5 w-5" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={prev} className="h-12 w-12 text-white hover:bg-white/10">
                        <SkipBack className="h-7 w-7 fill-current" />
                    </Button>

                    <Button
                        size="icon"
                        onClick={togglePlay}
                        className="h-16 w-16 rounded-full bg-white text-[#170f23] shadow-lg hover:bg-white/90 hover:scale-105 transition-all"
                    >
                        {isPlaying ? (
                            <Pause className="h-8 w-8 fill-current" />
                        ) : (
                            <Play className="h-8 w-8 fill-current ml-1" />
                        )}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={next} className="h-12 w-12 text-white hover:bg-white/10">
                        <SkipForward className="h-7 w-7 fill-current" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleRepeat}
                        className={cn("h-10 w-10 text-white/50 hover:text-white hover:bg-white/10 relative", repeatMode !== 'none' && "text-[#9b4de0]")}
                    >
                        <Repeat className="h-5 w-5" />
                        {repeatMode === 'one' && (
                            <span className="absolute text-[8px] font-bold top-1.5 right-1.5">1</span>
                        )}
                    </Button>
                </div>

                {/* Extra Controls */}
                <div className="mt-6 flex w-full justify-between px-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-white/50 hover:text-white hover:bg-white/10">
                                <Moon className="h-4 w-4" />
                                {sleepTimer ? `${sleepTimer}p` : "Hẹn giờ"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#231b2e] border-white/10 text-white">
                            <DropdownMenuLabel>Hẹn giờ tắt</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {[15, 30, 45, 60].map(m => (
                                <DropdownMenuItem key={m} onClick={() => setSleepTimer(m)} className="hover:bg-white/10 cursor-pointer">
                                    {m} phút
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => setSleepTimer(null)} className="hover:bg-white/10 cursor-pointer">Tắt</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-white/50 hover:text-white hover:bg-white/10">
                                {speed}x
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#231b2e] border-white/10 text-white">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                                <DropdownMenuItem key={s} onClick={() => setSpeed(s)} className="hover:bg-white/10 cursor-pointer">
                                    {s}x
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
