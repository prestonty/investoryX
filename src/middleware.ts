import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
