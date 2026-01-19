"use client";

import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <BookOpen className="h-24 w-24 text-zinc-200 dark:text-zinc-700" />
            <h1 className="mt-6 text-4xl font-bold">404</h1>
            <h2 className="mt-2 text-xl font-medium text-zinc-600 dark:text-zinc-400">
                Không tìm thấy trang
            </h2>
            <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
                Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/">
                    <Button className="gap-2">
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </Button>
                </Link>
                <Link href="/search">
                    <Button variant="outline" className="gap-2">
                        <Search className="h-4 w-4" />
                        Tìm kiếm
                    </Button>
                </Link>
            </div>
        </div>
    );
}
