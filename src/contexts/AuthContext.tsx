"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAuthState, type AuthState } from "@/lib/auth";
import { setSessionExpiredHandler } from "@/lib/api";

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
    const router = useRouter();
    // Several requests can fail at once; send the user to log in only once.
    const redirectingRef = useRef(false);

    // Re-read on navigation: login and logout both change the route.
    useEffect(() => {
        setStatus(getAuthState());
        redirectingRef.current = false;
    }, [pathname]);

    // The one place an expired session is handled, for every page.
    useEffect(() => {
        setSessionExpiredHandler(() => {
            // The failed refresh already cleared the session cookies.
            setStatus(getAuthState());
            const here = window.location.pathname + window.location.search;
            if (redirectingRef.current || window.location.pathname === "/login") return;
            redirectingRef.current = true;
            toast.error("Your session expired. Please log in again.");
            router.replace(`/login?redirectTo=${encodeURIComponent(here)}`);
        });
        return () => setSessionExpiredHandler(null);
    }, [router]);

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
