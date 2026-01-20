"use client";

import * as React from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMediaSession } from "@/hooks/useMediaSession";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import dynamic from "next/dynamic";

const FullScreenPlayer = dynamic(() => import("@/components/player/FullScreenPlayer").then(mod => mod.FullScreenPlayer), {
    ssr: false
});

export function AudioPlayer() {
    const {
        currentTrack,
        currentBook,
        currentTime,
        duration,
        setAudioRef,
        setVolume,
        setSpeed,
        setCurrentTime,
        setDuration,
        next,
        isPlaying,
        sleepTimer,
        sleepMode,
        decrementSleepTimer,
        playlist
    } = usePlayer();

    const { saveProgress, settings, isLoaded } = useLocalStorage();
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [isFullPlayerOpen, setIsFullPlayerOpen] = React.useState(false);

    useMediaSession(); // Initialize Media Session API

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

    // Save progress periodically
    const currentTimeRef = React.useRef(currentTime);
    React.useEffect(() => {
        currentTimeRef.current = currentTime;
    }, [currentTime]);

    React.useEffect(() => {
        if (!currentBook || !currentTrack) return;

        const interval = setInterval(() => {
            const timeNow = currentTimeRef.current;
            if (timeNow > 0) {
                saveProgress(currentBook.slug, {
                    current_chapter_id: currentTrack.id,
                    chapterIndex: currentTrack.chapter_index,
                    position: Math.floor(timeNow),
                    last_listened_at: new Date().toISOString(),
                    metadata: {
                        title: currentBook.title,
                        thumbnail_url: currentBook.thumbnail_url,
                        author_name: currentBook.author_name,
                        slug: currentBook.slug,
                        total_chapters: currentBook.total_chapters
                    }
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
            setDuration(Math.floor(audioRef.current.duration));
        }
    };

    const handleEnded = () => {
        next();
    };

    // If no track is loaded, render nothing (or hidden audio if needed for persistence logic persistence which we moved to store, but audio ref is here)
    // Actually, we need audio element always if we want to control it via store ref

    const handleError = () => {
        console.error("Audio playback error. Auto-skipping to next track.");
        if (playlist.length > 0) {
            next();
        }
    };

    return (
        <>
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={handleError}
                preload="metadata"
                className="hidden"
            />

            {currentTrack && currentBook && (
                <>
                    <MiniPlayer onOpenFull={() => setIsFullPlayerOpen(true)} />
                    <FullScreenPlayer
                        isOpen={isFullPlayerOpen}
                        onClose={() => setIsFullPlayerOpen(false)}
                    />
                    {/* Space for MiniPlayer */}
                    <div className="h-[60px] md:h-0" />
                </>
            )}
        </>
    );
}
