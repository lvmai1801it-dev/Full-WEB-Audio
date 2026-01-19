// API Types for Audio Platform

export interface Author {
    id: string; // UUID
    name: string;
    slug: string;
    avatar_url?: string;
}

export interface Genre {
    id: string; // UUID
    name: string;
    slug: string;
    book_count?: number;
}

export interface Chapter {
    id: string; // UUID
    title: string;
    chapter_index: number;
    audio_url: string;
    duration_seconds: number;
}

export interface Book {
    id: string; // UUID
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    source_url?: string;
    total_chapters: number;
    view_count: number;
    created_at: string;
    updated_at?: string;
    author_id?: number;
    author_name?: string;
    author_slug?: string;
    genres: Genre[];
    chapters?: Chapter[];
}

export interface BooksResponse {
    data: Book[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface SearchResponse {
    query: string;
    data: Book[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Player State
export interface PlayerState {
    isPlaying: boolean;
    currentTrack: Chapter | null;
    currentBook: Book | null;
    playlist: Chapter[];
    currentIndex: number;
    currentTime: number;
    duration: number;
    volume: number;
    speed: number;
    sleepTimer: number | null; // minutes remaining
    sleepMode: 'time' | 'chapter' | null;
}

// LocalStorage Types
export interface BookProgress {
    chapterId: string;
    chapterIndex: number;
    position: number; // seconds
    updatedAt: string;
}

export interface UserSettings {
    volume: number;
    speed: number;
    autoNext: boolean;
    theme: 'light' | 'dark' | 'system';
}

export interface AudioStorage {
    progress: Record<string, BookProgress>; // keyed by book slug
    settings: UserSettings;
    favorites: string[]; // book slugs
}
