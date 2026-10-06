// Session and guest-mode state, read from cookies.
//
// The API keeps the access and refresh tokens in httpOnly cookies, so this code
// never sees or stores a token. The API also sets a non-secret `session_active`
// cookie that only tells the UI a session probably exists; the API is the real
// authority (requests get 401 and are refreshed by `request` in ./api).
// Components read this through AuthContext rather than calling it directly.

const SESSION_HINT_COOKIE = "session_active";

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

    // Full page load (not a client-side navigation) so no in-memory state from
    // the logged-in session survives.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
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
