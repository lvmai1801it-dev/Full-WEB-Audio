"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Khám Phá", icon: Home },
        { href: "/search", label: "Tìm Kiếm", icon: Search },
        { href: "/library", label: "Thư Viện", icon: Library },
        { href: "/profile", label: "Cá Nhân", icon: User },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[#170f23] pb-[140px] md:hidden">
            {/* Main Content Area */}
            <main className="flex-1 px-4 py-4">{children}</main>

            {/* Bottom Navigation - Zing Style */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-4 py-2 transition-all",
                                    isActive
                                        ? "text-[#9b4de0]"
                                        : "text-white/50 hover:text-white/80"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
