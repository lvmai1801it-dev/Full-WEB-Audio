"use client";

import { usePathname } from "next/navigation";
import { MobileLayout } from "./MobileLayout";
import { DesktopLayout } from "./DesktopLayout";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Routes that might need full screen (no layout) can be handled here
    // const isFullScreen = pathname.startsWith('/player');

    return (
        <>
            <MobileLayout>{children}</MobileLayout>
            <DesktopLayout>{children}</DesktopLayout>
        </>
    );
}
