// Errors thrown by the API client (lib/api.ts). Catch ApiError to handle every
// failed request; check for NetworkError or TimeoutError to tell "server
// unreachable" or "server too slow" apart from an error the server reported.

// Stable codes the backend sends for errors the UI treats specially
// (src/core/errors.py in the backend). Branch on these, never on message text.
export type ApiErrorCode = "invalid_credentials" | "email_not_verified" | "email_taken";

interface ApiErrorDetails {
    // Present only for errors the backend gives a stable code.
    code?: string;
    // Matches the backend's logs for this request; include it in bug reports.
    requestId?: string;
    cause?: unknown;
}

// The server answered with an error status; `message` is the API's explanation
// when it gave one.
export class ApiError extends Error {
    readonly code?: string;
    readonly requestId?: string;

    constructor(
        message: string,
        public readonly status: number,
        details: ApiErrorDetails = {},
    ) {
        super(message);
        this.name = "ApiError";
        this.code = details.code;
        this.requestId = details.requestId;
        this.cause = details.cause;
    }

    hasCode(code: ApiErrorCode): boolean {
        return this.code === code;
    }
}

// The request never got a response: offline, DNS failure, CORS rejection, or
// the server is down. `status` is 0 because there was no HTTP response.
export class NetworkError extends ApiError {
    constructor(details: Omit<ApiErrorDetails, "code"> = {}) {
        super(
            "Can't reach the server. Check your internet connection and try again.",
            0,
            details,
        );
        this.name = "NetworkError";
    }
}

// The server didn't finish responding in time (it may be overloaded or stuck).
// `status` is 0 because no complete response arrived.
export class TimeoutError extends ApiError {
    constructor(details: Omit<ApiErrorDetails, "code"> = {}) {
        super("The server took too long to respond. Please try again.", 0, details);
        this.name = "TimeoutError";
    }
}

// True for failures worth reporting: the server broke, or couldn't be reached
// in time. 4xx errors (wrong password, validation) are expected and aren't.
export function isUnexpected(error: ApiError): boolean {
    return error.status === 0 || error.status >= 500;
}
