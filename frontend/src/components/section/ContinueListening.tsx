"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { HorizontalList } from "./HorizontalList";
import type { Book } from "@/types";
import { useEffect, useState } from "react";

export function ContinueListening() {
    const { getRecentlyPlayed, isLoaded } = useLocalStorage();
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        if (!isLoaded) return;

        const recent = getRecentlyPlayed();
        if (recent.length === 0) return;

        // Map recent progress to Book-like objects if metadata exists
        const historyBooks: Book[] = recent
            .filter(item => item.metadata)
            .map(item => ({
                id: item.book_id,
                slug: item.metadata!.slug,
                title: item.metadata!.title,
                thumbnail_url: item.metadata!.thumbnail_url,
                author_name: item.metadata!.author_name,
                total_chapters: item.metadata!.total_chapters || 0,
                // Mock required fields for Book type
                source_url: "",
                is_published: true,
                created_at: "",
                updated_at: "",
                view_count: 0
            }));

        setBooks(historyBooks);
    }, [isLoaded, getRecentlyPlayed]);

    if (books.length === 0) return null;

    return (
        <HorizontalList
            title="Tiếp tục nghe"
            books={books}
        />
    );
}
