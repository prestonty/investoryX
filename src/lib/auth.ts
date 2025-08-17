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
export function logout(): void {
    if (typeof window === "undefined") return;
    deleteCookie("access_token");
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
