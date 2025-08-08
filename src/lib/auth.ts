// Authentication utility functions
import { getCurrentUser, type UserResponse } from "./api";

// Re-export UserResponse type for convenience
export type { UserResponse };

// Check if user is authenticated
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token");
}

// Get stored token
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
}

// Clear authentication data
export function logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
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
