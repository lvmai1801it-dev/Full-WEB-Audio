import { useState, useEffect, useCallback } from "react";
import type { AudioStorage, BookProgress, UserSettings } from "@/types";

const STORAGE_KEY = "audio_truyen_storage";

const DEFAULT_STORAGE: AudioStorage = {
    progress: {},
    settings: {
        volume: 0.8,
        speed: 1,
        autoNext: true,
        theme: "system",
    },
    favorites: [],
};

function getStorage(): AudioStorage {
    if (typeof window === "undefined") return DEFAULT_STORAGE;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_STORAGE, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error("Error reading localStorage:", e);
    }
    return DEFAULT_STORAGE;
}

function saveStorage(data: AudioStorage): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving localStorage:", e);
    }
}

export function useLocalStorage() {
    const [storage, setStorage] = useState<AudioStorage>(DEFAULT_STORAGE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load on mount
    useEffect(() => {
        setStorage(getStorage());
        setIsLoaded(true);
    }, []);

    // Save progress for a book
    const saveProgress = useCallback((bookSlug: string, progress: BookProgress) => {
        setStorage((prev) => {
            const updated = {
                ...prev,
                progress: {
                    ...prev.progress,
                    [bookSlug]: {
                        ...progress,
                        updatedAt: new Date().toISOString(),
                    },
                },
            };
            saveStorage(updated);
            return updated;
        });
    }, []);

    // Get progress for a book
    const getProgress = useCallback((bookSlug: string): BookProgress | null => {
        return storage.progress[bookSlug] || null;
    }, [storage.progress]);

    // Update settings
    const updateSettings = useCallback((settings: Partial<UserSettings>) => {
        setStorage((prev) => {
            const updated = {
                ...prev,
                settings: { ...prev.settings, ...settings },
            };
            saveStorage(updated);
            return updated;
        });
    }, []);

    // Toggle favorite
    const toggleFavorite = useCallback((bookSlug: string) => {
        setStorage((prev) => {
            const isFavorite = prev.favorites.includes(bookSlug);
            const favorites = isFavorite
                ? prev.favorites.filter((s) => s !== bookSlug)
                : [...prev.favorites, bookSlug];

            const updated = { ...prev, favorites };
            saveStorage(updated);
            return updated;
        });
    }, []);

    // Check if book is favorite
    const isFavorite = useCallback((bookSlug: string): boolean => {
        return storage.favorites.includes(bookSlug);
    }, [storage.favorites]);

    // Get recently played books
    const getRecentlyPlayed = useCallback((): string[] => {
        return Object.entries(storage.progress)
            .sort((a, b) => new Date(b[1].updatedAt).getTime() - new Date(a[1].updatedAt).getTime())
            .slice(0, 10)
            .map(([slug]) => slug);
    }, [storage.progress]);

    return {
        storage,
        isLoaded,
        saveProgress,
        getProgress,
        updateSettings,
        toggleFavorite,
        isFavorite,
        getRecentlyPlayed,
        settings: storage.settings,
        favorites: storage.favorites,
    };
}
