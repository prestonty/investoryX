import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getTokenExpiry(token: string): number | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (base64.length % 4)) % 4;
    const padded = base64.padEnd(base64.length + padding, "=");

    try {
        const payload = JSON.parse(atob(padded)) as { exp?: number };
        return typeof payload.exp === "number" ? payload.exp : null;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    // Get the pathname of the request (e.g. /, /protected, /dashboard)
    const path = request.nextUrl.pathname;

    // Define protected routes that require authentication
    const protectedRoutes = [
        "/dashboard",
        "/watchlist",
        "/stock",
        "/latest-news",
    ];

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        path.startsWith(route),
    );

    if (isProtectedRoute) {
        // Check for authentication token in cookies
        const token = request.cookies.get("access_token");

        if (!token || !token.value) {
            // No token found, redirect to login
            const loginUrl = new URL("/login", request.url);
            // Add the original URL as a query parameter so we can redirect back after login
            loginUrl.searchParams.set("redirectTo", path);
            return NextResponse.redirect(loginUrl);
        }

        const exp = getTokenExpiry(token.value);
        if (!exp || exp * 1000 <= Date.now()) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirectTo", path);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete("access_token");
            response.cookies.delete("refresh_token");
            return response;
        }

        // Token exists, allow access to protected route
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    ],
};
