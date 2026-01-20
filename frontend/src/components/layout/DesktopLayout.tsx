"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Search,
    Library,
    Radio,
    Star,
    TrendingUp,
    User,
    Settings,
    Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DesktopLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const mainNav = [
        { href: "/", label: "Khám Phá", icon: Home },
        { href: "/search", label: "Tìm Kiếm", icon: Search },
        { href: "/library", label: "Thư Viện", icon: Library },
    ];

    const exploreNav = [
        { href: "/top", label: "BXH Audio", icon: TrendingUp },
        { href: "/radio", label: "Radio", icon: Radio },
        { href: "/new", label: "Mới Phát Hành", icon: Star },
    ];

    const accountNav = [
        { href: "/profile", label: "Cá Nhân", icon: User },
        { href: "/settings", label: "Cài Đặt", icon: Settings },
    ];

    return (
        <div className="hidden min-h-screen md:flex">
            {/* Sidebar - Zing MP3 Style */}
            <aside className="fixed top-0 left-0 z-40 h-screen w-[240px] bg-[#231b2e] border-r border-white/5">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#9b4de0] to-[#e95288]">
                            <Headphones className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Audio<span className="text-[#9b4de0]">Truyện</span>
                        </span>
                    </Link>

                    {/* Main Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {mainNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-white/10 text-white border-l-4 border-[#9b4de0] -ml-px"
                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Divider */}
                        <div className="my-4 border-t border-white/10" />

                        {/* Explore Section */}
                        <div className="px-4 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                                Khám phá thêm
                            </span>
                        </div>
                        {exploreNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-white/10 text-white"
                                            : "text-white/50 hover:bg-white/5 hover:text-white/80"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* VIP Banner */}
                    <div className="mx-3 mb-4 rounded-xl bg-gradient-to-r from-[#9b4de0]/20 to-[#e95288]/20 p-4 border border-[#9b4de0]/30">
                        <p className="text-xs text-white/80 mb-2">
                            Nghe không giới hạn với
                        </p>
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9b4de0] to-[#e95288]">
                            Audio VIP
                        </span>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="border-t border-white/10 p-3 space-y-1">
                        {accountNav.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-all"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[240px] min-h-screen bg-[#170f23]">
                <div className="px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
