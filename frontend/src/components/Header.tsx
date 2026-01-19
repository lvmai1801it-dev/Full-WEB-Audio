"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, X, Moon, Sun, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchBox } from "@/components/SearchBox";

export function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isDark, setIsDark] = React.useState(false);

    // Check dark mode on mount
    React.useEffect(() => {
        const dark = document.documentElement.classList.contains("dark");
        setIsDark(dark);
    }, []);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
        setIsDark(!isDark);
        localStorage.setItem("theme", isDark ? "light" : "dark");
    };



    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Headphones className="h-8 w-8 text-orange-500" />
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        AudioTruyện
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-zinc-700 transition-colors hover:text-orange-500 dark:text-zinc-300"
                    >
                        Trang chủ
                    </Link>
                    <Link
                        href="/genre/tien-hiep"
                        className="text-sm font-medium text-zinc-700 transition-colors hover:text-orange-500 dark:text-zinc-300"
                    >
                        Tiên Hiệp
                    </Link>
                    <Link
                        href="/genre/ngon-tinh"
                        className="text-sm font-medium text-zinc-700 transition-colors hover:text-orange-500 dark:text-zinc-300"
                    >
                        Ngôn Tình
                    </Link>
                    <Link
                        href="/genre/trinh-tham"
                        className="text-sm font-medium text-zinc-700 transition-colors hover:text-orange-500 dark:text-zinc-300"
                    >
                        Trinh Thám
                    </Link>
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {/* Desktop search */}
                    <SearchBox className="hidden md:block w-64" />

                    {/* Mobile search toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                        {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                    </Button>

                    {/* Dark mode toggle */}
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    {/* Mobile menu toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile search bar */}
            {isSearchOpen && (
                <div className="border-t border-zinc-200 p-4 md:hidden dark:border-zinc-800">
                    <SearchBox onClose={() => setIsSearchOpen(false)} autoFocus />
                </div>
            )}

            {/* Mobile menu */}
            {isMenuOpen && (
                <nav className="border-t border-zinc-200 p-4 md:hidden dark:border-zinc-800">
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/"
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="/genre/tien-hiep"
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Tiên Hiệp
                        </Link>
                        <Link
                            href="/genre/ngon-tinh"
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Ngôn Tình
                        </Link>
                        <Link
                            href="/genre/trinh-tham"
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trinh Thám
                        </Link>
                        <Link
                            href="/genre/truyen-ma"
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Truyện Ma
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
