"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/utils";

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (value: number) => void;
    className?: string;
    showTime?: boolean;
}

export function ProgressBar({
    currentTime,
    duration,
    onSeek,
    className,
    showTime = true
}: ProgressBarProps) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                {showTime && (
                    <span className="w-10 text-right text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                        {formatDuration(currentTime)}
                    </span>
                )}

                <Slider
                    value={currentTime}
                    max={duration > 0 ? duration : 100}
                    step={1}
                    onChange={(val) => onSeek(val)}
                    className="flex-1 cursor-pointer"
                />

                {showTime && (
                    <span className="w-10 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                        {formatDuration(duration)}
                    </span>
                )}
            </div>
        </div>
    );
}
