"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Sparkles } from "lucide-react";
import { BookCard, BookCardSkeleton } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { getBooks, getGenres } from "@/lib/api";
import type { Book, Genre } from "@/types";

export default function HomePage() {
  const [latestBooks, setLatestBooks] = React.useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = React.useState<Book[]>([]);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [latestRes, popularRes, genresRes] = await Promise.all([
          getBooks({ sort: "latest", limit: 12 }),
          getBooks({ sort: "popular", limit: 8 }),
          getGenres(),
        ]);
        setLatestBooks(latestRes.data);
        setPopularBooks(popularRes.data);
        setGenres(genresRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white md:text-6xl">
            Nghe Truyện Audio
            <span className="block mt-2 text-yellow-200">Mọi Lúc, Mọi Nơi</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            Hàng ngàn tác phẩm từ Tiên Hiệp, Kiếm Hiệp, Ngôn Tình đến Trinh Thám.
            Nghe hoàn toàn miễn phí với chất lượng cao.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/genre/tien-hiep">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-zinc-100">
                Khám phá ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="py-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
                />
              ))
              : genres.map((genre) => (
                <Link key={genre.id} href={`/genre/${genre.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    {genre.name}
                    {genre.book_count !== undefined && (
                      <span className="ml-1 text-xs text-zinc-400">
                        ({genre.book_count})
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Latest Books */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Clock className="h-6 w-6 text-orange-500" />
              Mới Cập Nhật
            </h2>
            <Link
              href="/?sort=latest"
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-950/50">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))
                : latestBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Books */}
      <section className="bg-zinc-50 py-12 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              Phổ Biến Nhất
            </h2>
            <Link
              href="/?sort=popular"
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))
              : popularBooks.map((book) => (
                <BookCard key={book.id} book={book} showDescription />
              ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Tại sao chọn AudioTruyện?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Hoàn Toàn Miễn Phí</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Nghe không giới hạn, không cần đăng ký tài khoản, không quảng cáo làm phiền.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Tiếp Tục Nghe</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Tự động lưu tiến trình, bạn có thể tiếp tục nghe bất cứ lúc nào.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Kho Truyện Đa Dạng</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Từ Tiên Hiệp, Ngôn Tình đến Truyện Ma - đủ thể loại cho mọi sở thích.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
