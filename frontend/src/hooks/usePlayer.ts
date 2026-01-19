import { create } from "zustand";
import type { Book, Chapter, PlayerState } from "@/types";

interface PlayerActions {
    // Playback controls
    play: (chapter: Chapter, book: Book, playlist?: Chapter[]) => void;
    pause: () => void;
    resume: () => void;
    togglePlay: () => void;
    stop: () => void;

    // Navigation
    next: () => void;
    prev: () => void;
    goToChapter: (index: number) => void;

    // Time controls
    seek: (time: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;

    // Settings
    setVolume: (volume: number) => void;
    setSpeed: (speed: number) => void;

    // Sleep timer
    setSleepTimer: (minutes: number | null, mode?: 'time' | 'chapter') => void;
    decrementSleepTimer: () => void;

    // Audio element ref
    audioRef: HTMLAudioElement | null;
    setAudioRef: (ref: HTMLAudioElement | null) => void;
}

type PlayerStore = PlayerState & PlayerActions;

const DEFAULT_SETTINGS = {
    volume: 0.8,
    speed: 1,
};

export const usePlayer = create<PlayerStore>((set, get) => ({
    // Initial state
    isPlaying: false,
    currentTrack: null,
    currentBook: null,
    playlist: [],
    currentIndex: 0,
    currentTime: 0,
    duration: 0,
    volume: DEFAULT_SETTINGS.volume,
    speed: DEFAULT_SETTINGS.speed,
    sleepTimer: null,
    sleepMode: null,
    audioRef: null,

    setAudioRef: (ref) => set({ audioRef: ref }),

    play: (chapter, book, playlist) => {
        const chapters = playlist || book.chapters || [chapter];
        const index = chapters.findIndex((c) => c.id === chapter.id);

        set({
            currentTrack: chapter,
            currentBook: book,
            playlist: chapters,
            currentIndex: index >= 0 ? index : 0,
            isPlaying: true,
            currentTime: 0,
        });

        const { audioRef } = get();
        if (audioRef) {
            audioRef.src = chapter.audio_url;
            audioRef.play().catch(console.error);
        }
    },

    pause: () => {
        set({ isPlaying: false });
        get().audioRef?.pause();
    },

    resume: () => {
        set({ isPlaying: true });
        get().audioRef?.play().catch(console.error);
    },

    togglePlay: () => {
        const { isPlaying } = get();
        if (isPlaying) {
            get().pause();
        } else {
            get().resume();
        }
    },

    stop: () => {
        const { audioRef } = get();
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
        }
        set({
            isPlaying: false,
            currentTrack: null,
            currentBook: null,
            playlist: [],
            currentIndex: 0,
            currentTime: 0,
            duration: 0,
        });
    },

    next: () => {
        const { playlist, currentIndex, currentBook, sleepMode } = get();

        // If sleep mode is "chapter", stop here
        if (sleepMode === "chapter") {
            get().pause();
            set({ sleepTimer: null, sleepMode: null });
            return;
        }

        if (currentIndex < playlist.length - 1) {
            const nextChapter = playlist[currentIndex + 1];
            set({
                currentTrack: nextChapter,
                currentIndex: currentIndex + 1,
                currentTime: 0,
                isPlaying: true,
            });

            const { audioRef } = get();
            if (audioRef) {
                audioRef.src = nextChapter.audio_url;
                audioRef.play().catch(console.error);
            }
        } else {
            // End of playlist
            get().pause();
        }
    },

    prev: () => {
        const { playlist, currentIndex, currentTime, audioRef } = get();

        // If more than 3 seconds into track, restart current
        if (currentTime > 3) {
            if (audioRef) {
                audioRef.currentTime = 0;
            }
            set({ currentTime: 0 });
            return;
        }

        if (currentIndex > 0) {
            const prevChapter = playlist[currentIndex - 1];
            set({
                currentTrack: prevChapter,
                currentIndex: currentIndex - 1,
                currentTime: 0,
                isPlaying: true,
            });

            if (audioRef) {
                audioRef.src = prevChapter.audio_url;
                audioRef.play().catch(console.error);
            }
        }
    },

    goToChapter: (index) => {
        const { playlist, currentBook } = get();
        if (index >= 0 && index < playlist.length) {
            const chapter = playlist[index];
            set({
                currentTrack: chapter,
                currentIndex: index,
                currentTime: 0,
                isPlaying: true,
            });

            const { audioRef } = get();
            if (audioRef) {
                audioRef.src = chapter.audio_url;
                audioRef.play().catch(console.error);
            }
        }
    },

    seek: (time) => {
        const { audioRef } = get();
        if (audioRef) {
            audioRef.currentTime = time;
        }
        set({ currentTime: time });
    },

    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),

    setVolume: (volume) => {
        const { audioRef } = get();
        if (audioRef) {
            audioRef.volume = volume;
        }
        set({ volume });
    },

    setSpeed: (speed) => {
        const { audioRef } = get();
        if (audioRef) {
            audioRef.playbackRate = speed;
        }
        set({ speed });
    },

    setSleepTimer: (minutes, mode = 'time') => {
        set({
            sleepTimer: minutes,
            sleepMode: minutes ? mode : null,
        });
    },

    decrementSleepTimer: () => {
        const { sleepTimer, sleepMode } = get();
        if (sleepTimer && sleepMode === 'time') {
            if (sleepTimer <= 1) {
                get().pause();
                set({ sleepTimer: null, sleepMode: null });
            } else {
                set({ sleepTimer: sleepTimer - 1 });
            }
        }
    },
}));
