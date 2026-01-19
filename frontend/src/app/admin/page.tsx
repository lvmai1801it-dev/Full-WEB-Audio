"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search, Edit, Trash2,
    Loader2, CheckCircle, AlertCircle, LogOut, User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminBooks, updateBook, deleteBook, addToCrawlQueue } from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
    const [activeTab, setActiveTab] = React.useState<"manage" | "crawl">("manage");
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const router = useRouter();

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/admin/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
            <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        {/* User info */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <User className="h-4 w-4" />
                            <span>{user?.username || "Admin"}</span>
                        </div>
                        {/* Home link */}
                        <Link href="/">
                            <Button variant="outline" size="sm">Về trang chủ</Button>
                        </Link>
                        {/* Logout button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 px-4">
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 w-fit">
                        <button
                            onClick={() => setActiveTab("manage")}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                activeTab === "manage"
                                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                            )}
                        >
                            Quản lý truyện
                        </button>
                        <button
                            onClick={() => setActiveTab("crawl")}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                activeTab === "crawl"
                                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                            )}
                        >
                            Crawl Data
                        </button>
                    </div>

                    {activeTab === "manage" ? <BookManager /> : <CrawlerPanel />}
                </div>
            </main>
        </div>
    );
}


function BookManager() {
    const [books, setBooks] = React.useState<Book[]>([]);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [editingBook, setEditingBook] = React.useState<Book | null>(null);

    const fetchBooks = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminBooks({ page, q: search });
            setBooks(res.data);
            if (res.pagination) {
                setTotalPages(res.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchBooks]);

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa truyện này?")) return;
        try {
            await deleteBook(id);
            fetchBooks(); // Refresh
        } catch (error) {
            alert("Xóa thất bại");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="Tìm kiếm truyện..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th className="px-4 py-3 w-[80px]">Cover</th>
                                <th className="px-4 py-3">Thông tin</th>
                                <th className="px-4 py-3 hidden md:table-cell">Chapters</th>
                                <th className="px-4 py-3 hidden md:table-cell">Trạng thái</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><div className="h-12 w-9 animate-pulse bg-zinc-200 rounded" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse bg-zinc-200 rounded" /></td>
                                        <td colSpan={3} />
                                    </tr>
                                ))
                            ) : books.length > 0 ? (
                                books.map((book) => (
                                    <tr key={book.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-4 py-3">
                                            <div className="relative h-12 w-9 overflow-hidden rounded bg-zinc-100">
                                                {book.thumbnail_url && (
                                                    <Image
                                                        src={book.thumbnail_url}
                                                        alt={book.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{book.title}</div>
                                            <div className="text-xs text-zinc-500">{book.author_name}</div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300">
                                                {book.total_chapters || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setEditingBook(book)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(book.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                        Không tìm thấy dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* Edit Modal */}
            {editingBook && (
                <EditModal
                    book={editingBook}
                    onClose={() => setEditingBook(null)}
                    onSave={() => {
                        setEditingBook(null);
                        fetchBooks();
                    }}
                />
            )}
        </div>
    );
}

function EditModal({ book, onClose, onSave }: { book: Book; onClose: () => void; onSave: () => void }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        title: book.title,
        description: book.description || "",
        thumbnail_url: book.thumbnail_url || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateBook(book.id, formData);
            onSave();
        } catch (error) {
            console.error(error);
            alert("Cập nhật thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in duration-200">
                <h2 className="mb-4 text-xl font-bold">Chỉnh sửa truyện</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Tên truyện
                        </label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Thumbnail URL
                        </label>
                        <Input
                            value={formData.thumbnail_url}
                            onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mô tả
                        </label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                            rows={5}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CrawlerPanel() {
    const [url, setUrl] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [logs, setLogs] = React.useState<string[]>([]);

    const handleCrawl = async () => {
        if (!url) return;
        setIsLoading(true);
        setLogs(prev => [`Starting crawl for: ${url}...`, ...prev]);
        try {
            const res = await addToCrawlQueue(url);
            if (res.success) {
                setLogs(prev => [`✅ Success! Book ID: ${res.id}`, ...prev]);
                setUrl("");
            } else {
                setLogs(prev => [`❌ Error: Failed to add to queue`, ...prev]);
            }
        } catch (error) {
            setLogs(prev => [`❌ Error: ${(error as Error).message}`, ...prev]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="mb-4 text-lg font-medium">Thêm truyện từ nguồn ngoài</h3>
                <div className="flex gap-2">
                    <Input
                        placeholder="Nhập URL truyện (ví dụ: https://trumtruyen.vn/...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button onClick={handleCrawl} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crawl
                    </Button>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                    Hệ thống sẽ tự động tải thông tin truyện, tác giả, thể loại và danh sách chương.
                </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="mb-4 text-lg font-medium">Logs</h3>
                <div className="h-48 overflow-y-auto rounded bg-zinc-100 p-4 font-mono text-sm dark:bg-zinc-950">
                    {logs.length === 0 ? (
                        <span className="text-zinc-400">Chưa có hoạt động nào...</span>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="mb-1">{log}</div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
