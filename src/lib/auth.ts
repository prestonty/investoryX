// Authentication utility functions
//
// The API keeps the access and refresh tokens in httpOnly cookies, so this code
// never sees or stores a token. The API also sets a non-secret `session_active`
// cookie that only tells the UI a session probably exists; the API is the real
// authority (requests get 401 and are refreshed by authFetch in ./api).
import { getCurrentUser, refreshSession, type UserResponse } from "./api";

// Re-export UserResponse type for convenience
export type { UserResponse };

const SESSION_HINT_COOKIE = "session_active";

// Passed to the API helpers in place of a token: in the browser the httpOnly
// cookies authenticate, and authFetch drops any Authorization header.
const COOKIE_SESSION = "cookie-session";

function getCookie(name: string): string | null {
    if (typeof window === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name: string) {
    if (typeof window === "undefined") return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Check if user is authenticated (a session cookie exists; the API decides if it's valid)
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!getCookie(SESSION_HINT_COOKIE);
}

// Returns a placeholder for the API helpers' `token` argument when logged in.
// The real token is an httpOnly cookie that JavaScript can't (and needn't) read.
export function getToken(): string | null {
    return isAuthenticated() ? COOKIE_SESSION : null;
}

// Clear authentication data
export async function logout(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
        // Revokes the session server-side (its tokens stop working immediately)
        // and clears the httpOnly cookies.
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
    } catch (error) {
        console.error("Failed to call logout endpoint:", error);
    }

    deleteCookie(SESSION_HINT_COOKIE);
    // Token cookies written by JavaScript before tokens moved to httpOnly cookies.
    deleteCookie("access_token");
    deleteCookie("refresh_token");

    // Clear guest mode if active
    document.cookie =
        "guest_mode=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Redirect to login page
    window.location.href = "/login";
}

// Get current user data
export async function getCurrentUserData(): Promise<UserResponse | null> {
    if (!isAuthenticated()) return null;

    try {
        return await getCurrentUser(COOKIE_SESSION);
    } catch (error) {
        // Only a 401 (after authFetch already tried refreshing) means the session
        // is gone; a network blip or server error shouldn't log the user out.
        if ((error as { status?: number })?.status === 401) {
            logout();
        }
        return null;
    }
}

// Check if user should be redirected to login
export function requireAuth(): boolean {
    if (!isAuthenticated()) {
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return false;
    }
    return true;
}

// Guest mode — browse without an account, data stored locally
export function enterGuestMode(): void {
    if (typeof window === "undefined") return;
    document.cookie = "guest_mode=true;path=/;max-age=86400"; // 24h
}

export function exitGuestMode(): void {
    if (typeof window === "undefined") return;
    document.cookie =
        "guest_mode=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}

export function isGuestMode(): boolean {
    if (typeof window === "undefined") return false;
    return !isAuthenticated() && document.cookie.includes("guest_mode=true");
}

export type AuthState = "authenticated" | "guest" | "unauthenticated";

export function getAuthState(): AuthState {
    if (isAuthenticated()) return "authenticated";
    if (isGuestMode()) return "guest";
    return "unauthenticated";
}

// Refresh the session (rotates the httpOnly refresh cookie)
export async function refreshToken(): Promise<string | null> {
    return (await refreshSession()) ? COOKIE_SESSION : null;
}

// Returns the session placeholder, refreshing first if no session cookie is present
export async function getTokenWithRefresh(): Promise<string | null> {
    if (isAuthenticated()) return COOKIE_SESSION;
    return refreshToken();
}
