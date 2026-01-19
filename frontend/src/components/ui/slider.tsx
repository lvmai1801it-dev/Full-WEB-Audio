"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
    className?: string;
    trackClassName?: string;
    thumbClassName?: string;
    disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    (
        {
            value,
            min = 0,
            max = 100,
            step = 1,
            onChange,
            className,
            trackClassName,
            disabled = false,
        },
        ref
    ) => {
        const trackRef = React.useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = React.useState(false);

        const percentage = ((value - min) / (max - min)) * 100;

        const handleChange = React.useCallback(
            (clientX: number) => {
                if (!trackRef.current || disabled) return;

                const rect = trackRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                const newValue = min + percent * (max - min);
                const steppedValue = Math.round(newValue / step) * step;

                onChange?.(Math.max(min, Math.min(max, steppedValue)));
            },
            [min, max, step, onChange, disabled]
        );

        const handleMouseDown = (e: React.MouseEvent) => {
            if (disabled) return;
            setIsDragging(true);
            handleChange(e.clientX);
        };

        const handleTouchStart = (e: React.TouchEvent) => {
            if (disabled) return;
            setIsDragging(true);
            handleChange(e.touches[0].clientX);
        };

        React.useEffect(() => {
            if (!isDragging) return;

            const handleMouseMove = (e: MouseEvent) => handleChange(e.clientX);
            const handleTouchMove = (e: TouchEvent) => handleChange(e.touches[0].clientX);
            const handleEnd = () => setIsDragging(false);

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleEnd);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("touchend", handleEnd);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleEnd);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("touchend", handleEnd);
            };
        }, [isDragging, handleChange]);

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex h-5 w-full touch-none select-none items-center",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div
                    ref={trackRef}
                    className={cn(
                        "relative h-1.5 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700",
                        trackClassName
                    )}
                >
                    <div
                        className="absolute h-full bg-orange-500 transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div
                    className={cn(
                        "absolute h-4 w-4 rounded-full border-2 border-orange-500 bg-white shadow transition-transform",
                        isDragging && "scale-110",
                        "dark:bg-zinc-900"
                    )}
                    style={{ left: `calc(${percentage}% - 8px)` }}
                />
            </div>
        );
    }
);
Slider.displayName = "Slider";

export { Slider };
