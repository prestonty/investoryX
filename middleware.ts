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
    const path = request.nextUrl.pathname;

    const token = request.cookies.get("access_token");

    // If a token exists but is expired, clear it and redirect to login on any route.
    // After logging in (or choosing not to), the user will have no token and be treated as a guest.
    if (token?.value) {
        const exp = getTokenExpiry(token.value);
        if (!exp || exp * 1000 <= Date.now()) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirectTo", path);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete("access_token");
            response.cookies.delete("refresh_token");
            return response;
        }
    }

    // Protected routes require a valid token (no guest access)
    const protectedRoutes = ["/watchlist", "/stock", "/latest-news"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        path.startsWith(route),
    );

    if (isProtectedRoute && !token?.value) {
        const guestMode = request.cookies.get("guest_mode");
        if (guestMode?.value !== "true") {
            // No token, no guest_mode — first-time visitor, enter guest mode automatically
            const response = NextResponse.next();
            response.cookies.set("guest_mode", "true", { path: "/", maxAge: 86400 });
            return response;
        }
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
