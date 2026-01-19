"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { id: number; username: string } | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = React.useState<string | null>(null);
    const [user, setUser] = React.useState<{ id: number; username: string } | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check for existing token on mount
    React.useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // Redirect logic
    React.useEffect(() => {
        if (isLoading) return;

        const isAdminRoute = pathname?.startsWith("/admin");
        const isLoginPage = pathname === "/admin/login";

        if (isAdminRoute && !isLoginPage && !token) {
            router.push("/admin/login");
        }

        if (isLoginPage && token) {
            router.push("/admin");
        }
    }, [token, isLoading, pathname, router]);

    const login = async (username: string, password: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Login failed");
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        router.push("/admin");
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        router.push("/admin/login");
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!token,
                isLoading,
                user,
                token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

/**
 * Get token for API calls (can be used outside of React components)
 */
export function getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}
