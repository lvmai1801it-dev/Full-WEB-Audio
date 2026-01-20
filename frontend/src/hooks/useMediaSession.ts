"use client";

import { useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";

export function useMediaSession() {
    const {
        currentTrack,
        currentBook,
        isPlaying,
        resume,
        pause,
        next,
        prev,
        seek
    } = usePlayer();

    // Update metadata
    useEffect(() => {
        if (!currentTrack || !currentBook || !("mediaSession" in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentBook.author_name || "Unknown Author",
            album: currentBook.title,
            artwork: [
                { src: currentBook.thumbnail_url || "/placeholder.png", sizes: "512x512", type: "image/jpeg" },
            ],
        });
    }, [currentTrack, currentBook]);

    // Update playback state
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }, [isPlaying]);

    // Register handlers
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        const actionHandlers = [
            ['play', resume],
            ['pause', pause],
            ['previoustrack', prev],
            ['nexttrack', next],
            ['seekto', (details: MediaSessionActionDetails) => {
                if (details.seekTime) seek(details.seekTime);
            }],
        ] as const;

        for (const [action, handler] of actionHandlers) {
            try {
                navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler as any);
            } catch (error) {
                console.warn(`The media session action "${action}" is not supported yet.`);
            }
        }

        return () => {
            // Cleanup if needed, though usually overwriting handlers is fine
        };
    }, [resume, pause, next, prev, seek]);
}
