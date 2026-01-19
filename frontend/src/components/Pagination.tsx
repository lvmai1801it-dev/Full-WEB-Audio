"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            if (start === 1) end = Math.min(totalPages, maxVisible);
            if (end === totalPages) start = Math.max(1, totalPages - maxVisible + 1);

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className={cn("flex items-center justify-center gap-1", className)}>
            {/* First Page */}
            <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 sm:flex"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs sm:text-sm"
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            ))}

            {/* Next Page */}
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 sm:flex"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
