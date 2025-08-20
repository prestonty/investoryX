// Authentication utility functions
import { getCurrentUser, type UserResponse } from "./api";

// Re-export UserResponse type for convenience
export type { UserResponse };

// Cookie utility functions
function setCookie(name: string, value: string, days: number = 7) {
    if (typeof window === "undefined") return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

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

// Check if user is authenticated
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!getCookie("access_token");
}

// Get stored token
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie("access_token");
}

// Clear authentication data
export async function logout(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
        // Call backend logout endpoint to clear cookies
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
    } catch (error) {
        console.error("Failed to call logout endpoint:", error);
    }

    // Also clear frontend cookies as backup
    deleteCookie("access_token");
    deleteCookie("refresh_token");

    // Redirect to login page
    window.location.href = "/login";
}

// Get current user data
export async function getCurrentUserData(): Promise<UserResponse | null> {
    const token = getToken();
    if (!token) return null;

    try {
        return await getCurrentUser(token);
    } catch (error) {
        // Token might be expired or invalid
        logout();
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

// Set authentication token (used after successful login)
export function setAuthToken(token: string): void {
    setCookie("access_token", token, 7); // 7 days expiry
}

// Refresh access token using refresh token
export async function refreshToken(): Promise<string | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/auth/refresh`,
            {
                method: "POST",
                credentials: "include", // Include cookies
            },
        );

        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        }
        return null;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
    }
}

// Enhanced getToken function that attempts to refresh if needed
export async function getTokenWithRefresh(): Promise<string | null> {
    const token = getToken();
    if (token) {
        return token;
    }

    // Try to refresh the token
    const newToken = await refreshToken();
    if (newToken) {
        return newToken;
    }

    return null;
}
