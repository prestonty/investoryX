"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAuthState, type AuthState } from "@/lib/auth";

// "loading" until the first client render has read the cookies; data loading
// waits for it so pages never briefly treat a guest as logged in (or vice versa).
export type AuthStatus = AuthState | "loading";

interface AuthContextValue {
    status: AuthStatus;
    // Logged in with a server session; otherwise data lives in localStorage.
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
    status: "loading",
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const pathname = usePathname();

    // Re-read on navigation: login and logout both change the route.
    useEffect(() => {
        setStatus(getAuthState());
    }, [pathname]);

    return (
        <AuthContext.Provider
            value={{ status, isAuthenticated: status === "authenticated" }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
