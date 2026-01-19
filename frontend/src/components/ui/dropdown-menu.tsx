"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
    children: React.ReactNode;
}

interface DropdownMenuContextValue {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function DropdownMenu({ children }: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left">{children}</div>
        </DropdownMenuContext.Provider>
    );
}

function DropdownMenuTrigger({
    children,
    className,
    asChild,
}: {
    children: React.ReactNode;
    className?: string;
    asChild?: boolean;
}) {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

    const handleClick = () => context.setOpen((prev) => !prev);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
            onClick: handleClick,
        });
    }

    return (
        <button onClick={handleClick} className={className}>
            {children}
        </button>
    );
}

function DropdownMenuContent({
    children,
    className,
    align = "end",
}: {
    children: React.ReactNode;
    className?: string;
    align?: "start" | "center" | "end";
}) {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

    const ref = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        if (!context.open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                context.setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [context.open, context]);

    if (!context.open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800",
                {
                    "right-0": align === "end",
                    "left-0": align === "start",
                    "left-1/2 -translate-x-1/2": align === "center",
                },
                "bottom-full mb-2",
                className
            )}
        >
            {children}
        </div>
    );
}

function DropdownMenuItem({
    children,
    className,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}) {
    const context = React.useContext(DropdownMenuContext);

    const handleClick = () => {
        if (disabled) return;
        onClick?.();
        context?.setOpen(false);
    };

    return (
        <button
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700",
                disabled && "pointer-events-none opacity-50",
                className
            )}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function DropdownMenuLabel({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("px-2 py-1.5 text-sm font-semibold text-zinc-500", className)}>
            {children}
        </div>
    );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
    return <div className={cn("-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-700", className)} />;
}

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
};
