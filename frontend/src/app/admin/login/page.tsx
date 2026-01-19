"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError((err as Error).message || "Đăng nhập thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 px-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Admin Dashboard
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Đăng nhập để quản lý hệ thống
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-zinc-400 text-sm mt-6">
                    © 2026 Xeon Audio. All rights reserved.
                </p>
            </div>
        </div>
    );
}
