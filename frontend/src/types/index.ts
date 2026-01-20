export type UUID = string;

// Standard API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

// Pagination Wrapper (Legacy/Actual API format)
export interface PaginatedResponse<T> {
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Domain Entities

export interface Author {
    id: UUID;
    name: string;
    slug: string;
    avatar_url?: string;
}

export interface Genre {
    id: UUID;
    name: string;
    slug: string;
    book_count?: number;
}

export interface Book {
    id: UUID;
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    source_url: string;
    total_chapters: number;
    is_published: boolean;

    // Relations
    authors?: Author[];
    genres?: Genre[];
    chapters?: Chapter[];

    // Legacy/Flat fields (Optional compatibility)
    author_name?: string;
    author_slug?: string;
    view_count?: number;
    book_count?: number;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export type BooksResponse = PaginatedResponse<Book>;
export type SearchResponse = PaginatedResponse<Book>;

export interface Chapter {
    id: UUID;
    book_id: UUID;
    title: string;
    chapter_index: number;
    audio_url: string;
    duration_seconds: number;
    created_at: string;
}

export interface UserProgress {
    user_id: UUID;
    book_id: UUID;
    current_chapter_id: UUID;
    position_seconds: number;
    is_completed: boolean;
    last_listened_at: string;

    // Legacy/Frontend State
    chapterIndex?: number;
    position?: number;

    // Minimal Metadata for UI (History)
    metadata?: {
        title: string;
        thumbnail_url?: string;
        author_name?: string;
        slug: string;
        total_chapters?: number;
    };
}

export type BookProgress = UserProgress;

// Specific for Player State
export interface Track {
    id: UUID;
    title: string;
    artist: string;        // Usually Author name
    artwork?: string;      // Book thumbnail
    src: string;           // Chapter audio_url
    bookId: UUID;          // For grouping/context
    chapterIndex: number;
    duration: number;
}

export interface UserSettings {
    volume: number;
    speed: number;
    autoNext: boolean;
    theme: "light" | "dark" | "system";
}

export interface AudioStorage {
    progress: Record<string, UserProgress>;
    settings: UserSettings;
    favorites: string[];
}

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
    sleepTimer: number | null;
    sleepMode: "time" | "chapter" | null;
    isShuffle: boolean;
    repeatMode: "none" | "all" | "one";
    audioRef: HTMLAudioElement | null;
}
