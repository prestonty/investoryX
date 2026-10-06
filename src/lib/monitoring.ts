// The one place unexpected API failures are reported. It only logs for now;
// to send them to Sentry, install @sentry/nextjs and replace the body with
// Sentry.captureException(error, { tags: { path, status }, extra: { requestId } }).
//
// The request ID matches the backend's log lines for the same request, so a
// report can be traced to exactly what the server did.

import type { ApiError } from "./errors";

export function reportError(error: ApiError, path: string): void {
    console.error(
        `[api] ${error.name} on ${path} (status ${error.status}, request ${error.requestId ?? "unknown"}):`,
        error.message,
    );
}
