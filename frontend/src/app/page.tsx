import { getBooks } from "@/services/book.service";
import { getGenres } from "@/services/genre.service";
import { HeroSection } from "@/components/section/HeroSection";
import { HorizontalList } from "@/components/section/HorizontalList";
import { ContinueListening } from "@/components/section/ContinueListening";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  // Parallel data fetching
  let featuredBook: any = null;
  let newBooks: any[] = [];
  let popularBooks: any[] = [];
  let genres: any[] = [];

  try {
    const [
      featuredBooksRes,
      newBooksRes,
      popularBooksRes,
      genresRes
    ] = await Promise.all([
      getBooks({ limit: 1, page: 1 }).catch(() => ({ data: [] })), // Ideally we want a random or specific featured one
      getBooks({ limit: 10, page: 1 }).catch(() => ({ data: [] })), // Latest (assuming default sort is created_at desc)
      getBooks({ limit: 10, page: 2 }).catch(() => ({ data: [] })), // "Popular" placeholder (just page 2 for now, or sort by view_count if supported)
      getGenres().catch(() => ({ data: [] }))
    ]);

    featuredBook = featuredBooksRes.data && featuredBooksRes.data[0] ? featuredBooksRes.data[0] : null;
    newBooks = newBooksRes.data || [];
    popularBooks = popularBooksRes.data || []; // TODO: Implement sort=view_count on backend
    genres = genresRes.data || [];
  } catch (error) {
    console.error("Failed to fetch home data", error);
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <div className="px-4 md:px-0">
        <HeroSection book={featuredBook} />
      </div>

      {/* Categories / Genres Chips */}
      <div className="px-4 md:px-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Thể loại</h2>
          <Link href="/search">
            <Button variant="link" className="text-orange-500">Tất cả <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.slice(0, 8).map((genre) => (
            <Link key={genre.id} href={`/genre/${genre.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:text-orange-500 bg-white dark:bg-zinc-900"
              >
                {genre.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue Listening (Client Side) */}
      <ContinueListening />

      {/* New Releases */}
      <HorizontalList
        title="Mới cập nhật"
        books={newBooks}
        href="/search?sort=latest"
      />

      {/* Popular / Trending */}
      <HorizontalList
        title="Được nghe nhiều"
        books={popularBooks}
        href="/search?sort=popular"
      />

      {/* Just for Discovery - Maybe Random? */}
      <HorizontalList
        title="Có thể bạn thích"
        books={newBooks.slice().reverse()}
      />
    </div>
  );
}
