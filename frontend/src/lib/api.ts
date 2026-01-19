import type { Book, BooksResponse, Genre, SearchResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost/WebAudio/backend/api";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}/${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Network error" }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// Books API
export async function getBooks(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    author?: string;
    sort?: "latest" | "popular" | "name";
}): Promise<BooksResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.genre) searchParams.set("genre", params.genre);
    if (params?.author) searchParams.set("author", params.author);
    if (params?.sort) searchParams.set("sort", params.sort);

    const query = searchParams.toString();
    return fetchAPI<BooksResponse>(`books.php${query ? `?${query}` : ""}`);
}

export async function getBook(slug: string): Promise<Book> {
    return fetchAPI<Book>(`books.php?slug=${encodeURIComponent(slug)}`);
}

// Genres API
export async function getGenres(): Promise<Genre[]> {
    return fetchAPI<Genre[]>("genres.php");
}

// Search API
export async function searchBooks(query: string, page = 1): Promise<SearchResponse> {
    return fetchAPI<SearchResponse>(
        `search.php?q=${encodeURIComponent(query)}&page=${page}`
    );
}


// Admin API - Requires authentication
function getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
}

async function fetchAdminAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getAdminToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    return fetchAPI<T>(endpoint, {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getAdminBooks(params?: { page?: number; limit?: number; q?: string }): Promise<BooksResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("action", "list");
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.q) searchParams.set("q", params.q);

    return fetchAdminAPI<BooksResponse>(`admin.php?${searchParams.toString()}`);
}

export async function updateBook(id: number, data: Partial<Book> & { is_published?: boolean | number }): Promise<{ success: boolean }> {
    return fetchAdminAPI(`admin.php?action=update&id=${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteBook(id: number): Promise<{ success: boolean }> {
    return fetchAdminAPI(`admin.php?action=delete&id=${id}`, {
        method: "DELETE",
    });
}

// Crawl API (Admin - requires auth for POST)
export async function addToCrawlQueue(url: string): Promise<{ success: boolean; id: number }> {
    return fetchAdminAPI("crawl.php", {
        method: "POST",
        body: JSON.stringify({ url }),
    });
}

export async function getCrawlQueue(): Promise<any> {
    // GET is public
    return fetchAPI("crawl.php");
}
