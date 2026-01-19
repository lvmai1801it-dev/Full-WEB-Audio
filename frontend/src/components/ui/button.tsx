import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50",
                    {
                        // Variants
                        "bg-orange-500 text-white hover:bg-orange-600 shadow-sm": variant === "default",
                        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700": variant === "secondary",
                        "border border-zinc-200 bg-transparent hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800": variant === "outline",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800": variant === "ghost",
                        "text-orange-500 underline-offset-4 hover:underline": variant === "link",
                        // Sizes
                        "h-10 px-4 py-2 text-sm": size === "default",
                        "h-8 px-3 text-xs": size === "sm",
                        "h-12 px-6 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
