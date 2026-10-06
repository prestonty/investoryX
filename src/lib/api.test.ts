import { afterEach, describe, expect, it, vi } from "vitest";

// Error reporting is checked by call, not by what it logs.
vi.mock("./monitoring", () => ({ reportError: vi.fn() }));
import {
    addToWatchlist,
    getWatchlist,
    getWatchlistQuotes,
    loginUser,
    runSimulator,
    searchStocks,
    setSessionExpiredHandler,
} from "./api";
import { ApiError, NetworkError, TimeoutError } from "./errors";
import { reportError } from "./monitoring";

const REFRESH_URL = "http://api.test/api/auth/refresh";

function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

// Replaces fetch with `handler` and returns the mock to inspect calls.
function mockFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => handler(url, init));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

function calledUrls(fetchMock: ReturnType<typeof mockFetch>): string[] {
    return fetchMock.mock.calls.map(([url]) => url);
}

// Session refresh only happens in the browser.
function inBrowser() {
    vi.stubGlobal("window", {});
}

// A server that never answers: the request only ends when its signal aborts.
function hang(_url: string, init: RequestInit): Promise<Response> {
    return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
    });
}

// Shrinks every timeout to `ms` so tests don't wait 15 seconds; returns the spy
// to check which timeout each request asked for.
function shortTimeouts(ms = 20) {
    const realTimeout = AbortSignal.timeout.bind(AbortSignal);
    return vi.spyOn(AbortSignal, "timeout").mockImplementation(() => realTimeout(ms));
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.mocked(reportError).mockClear();
    setSessionExpiredHandler(null);
});

describe("responses and errors", () => {
    it("returns the parsed JSON body", async () => {
        mockFetch(() => json(200, [{ watchlist_id: 1, stock_id: 7, user_id: 2 }]));

        await expect(getWatchlist()).resolves.toEqual([
            { watchlist_id: 1, stock_id: 7, user_id: 2 },
        ]);
    });

    it("uses FastAPI's detail message", async () => {
        mockFetch(() => json(400, { detail: "Stock already in watchlist" }));

        await expect(addToWatchlist(7)).rejects.toMatchObject({
            name: "ApiError",
            message: "Stock already in watchlist",
            status: 400,
        });
    });

    it("joins validation messages without the 'Value error' prefix", async () => {
        mockFetch(() =>
            json(422, {
                detail: [{ msg: "Value error, too short" }, { msg: "must contain a digit" }],
            }),
        );

        await expect(addToWatchlist(7)).rejects.toThrow("too short; must contain a digit");
    });

    it("falls back to the endpoint's message when the API gives none", async () => {
        mockFetch(() => new Response("<html>Bad Gateway</html>", { status: 502 }));

        await expect(addToWatchlist(7)).rejects.toMatchObject({
            message: "Failed to add to watchlist",
            status: 502,
        });
    });

    it("reports an unreachable server as a NetworkError, not 'Failed to fetch'", async () => {
        mockFetch(() => {
            throw new TypeError("Failed to fetch");
        });

        const error = await getWatchlist().catch((e) => e);
        expect(error).toBeInstanceOf(NetworkError);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(0);
        expect(error.message).toMatch(/can't reach the server/i);
    });

    it("lets deliberate cancellations through untouched", async () => {
        mockFetch(() => {
            throw new DOMException("The operation was aborted.", "AbortError");
        });

        const error = await searchStocks("AAPL").catch((e) => e);
        expect(error).not.toBeInstanceOf(ApiError);
        expect(error.name).toBe("AbortError");
    });
});

describe("session refresh", () => {
    it("refreshes once and retries when a login-only endpoint returns 401", async () => {
        inBrowser();
        let watchlistCalls = 0;
        const fetchMock = mockFetch((url) => {
            if (url === REFRESH_URL) return json(200, {});
            watchlistCalls++;
            return watchlistCalls === 1 ? json(401, { detail: "Expired" }) : json(200, []);
        });

        await expect(getWatchlist()).resolves.toEqual([]);
        expect(calledUrls(fetchMock)).toEqual([
            "http://api.test/api/watchlist/",
            REFRESH_URL,
            "http://api.test/api/watchlist/",
        ]);
    });

    it("retries only once, even if the retry is also rejected", async () => {
        inBrowser();
        const fetchMock = mockFetch((url) =>
            url === REFRESH_URL ? json(200, {}) : json(401, { detail: "Not authenticated" }),
        );

        await expect(getWatchlist()).rejects.toMatchObject({ status: 401 });
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("doesn't retry when the refresh itself fails", async () => {
        inBrowser();
        const fetchMock = mockFetch((url) =>
            url === REFRESH_URL ? json(401, {}) : json(401, { detail: "Not authenticated" }),
        );

        await expect(getWatchlist()).rejects.toMatchObject({ status: 401 });
        expect(calledUrls(fetchMock)).toEqual(["http://api.test/api/watchlist/", REFRESH_URL]);
    });

    it("shares one refresh between requests that fail at the same time", async () => {
        inBrowser();
        let refreshed = false;
        const fetchMock = mockFetch(async (url) => {
            if (url === REFRESH_URL) {
                await new Promise((resolve) => setTimeout(resolve, 10));
                refreshed = true;
                return json(200, {});
            }
            return refreshed ? json(200, []) : json(401, {});
        });

        await Promise.all([getWatchlist(), getWatchlist(), getWatchlistQuotes()]);
        expect(calledUrls(fetchMock).filter((url) => url === REFRESH_URL)).toHaveLength(1);
    });

    it("doesn't refresh when a wrong password gets a 401 on login", async () => {
        inBrowser();
        const fetchMock = mockFetch(() => json(401, { detail: "Incorrect email or password" }));

        await expect(loginUser({ username: "a@b.c", password: "x" })).rejects.toThrow(
            "Incorrect email or password",
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("doesn't refresh on the Next.js server, which has no browser cookies", async () => {
        const fetchMock = mockFetch(() => json(401, {}));

        await expect(getWatchlist()).rejects.toMatchObject({ status: 401 });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe("request format", () => {
    it("sends cookies and JSON bodies", async () => {
        const fetchMock = mockFetch(() => json(200, {}));

        await addToWatchlist(7);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://api.test/api/watchlist/");
        expect(init.method).toBe("POST");
        expect(init.credentials).toBe("include");
        expect(init.body).toBe('{"stock_id":7}');
        expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    });

    it("sends form data as-is, for the login form", async () => {
        const fetchMock = mockFetch(() => json(200, { access_token: "t", token_type: "bearer" }));

        await loginUser({ username: "a@b.c", password: "secret" });
        const [, init] = fetchMock.mock.calls[0];
        expect(init.body).toBeInstanceOf(FormData);
        expect((init.body as FormData).get("username")).toBe("a@b.c");
        // fetch sets the multipart Content-Type (with its boundary) itself.
        expect(new Headers(init.headers).has("Content-Type")).toBe(false);
    });

    it("forwards a server-side token as a Bearer header", async () => {
        const fetchMock = mockFetch(() => json(200, []));

        await getWatchlistQuotes("abc123");
        const [, init] = fetchMock.mock.calls[0];
        expect(new Headers(init.headers).get("Authorization")).toBe("Bearer abc123");
    });
});

describe("timeouts", () => {
    it("gives up on a hung server with a TimeoutError", async () => {
        shortTimeouts();
        mockFetch(hang);

        const error = await getWatchlist().catch((e) => e);
        expect(error).toBeInstanceOf(TimeoutError);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(0);
        expect(error.message).toMatch(/took too long/i);
    });

    it("also times out a response whose body never finishes", async () => {
        shortTimeouts();
        mockFetch((_url, init) => {
            const body = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode("[1,"));
                    init.signal?.addEventListener("abort", () =>
                        controller.error(init.signal?.reason),
                    );
                },
            });
            return new Response(body, { status: 200 });
        });

        await expect(getWatchlist()).rejects.toBeInstanceOf(TimeoutError);
    });

    it("waits 15 seconds by default and longer for running the simulator", async () => {
        const timeoutSpy = shortTimeouts();
        mockFetch(() => json(200, {}));

        await getWatchlist();
        await runSimulator(1, {});
        expect(timeoutSpy.mock.calls.map(([ms]) => ms)).toEqual([15_000, 120_000]);
    });

    it("still reports a caller's own cancellation as AbortError, not a timeout", async () => {
        mockFetch(hang);
        const controller = new AbortController();

        const pending = searchStocks("AAPL", controller.signal).catch((e) => e);
        controller.abort();
        const error = await pending;
        expect(error).not.toBeInstanceOf(ApiError);
        expect(error.name).toBe("AbortError");
    });
});

describe("error codes and request ids", () => {
    it("exposes the backend's stable error code", async () => {
        mockFetch(() =>
            json(401, { detail: "Invalid email or password", code: "invalid_credentials" }),
        );

        const error = await loginUser({ username: "a@b.c", password: "x" }).catch((e) => e);
        expect(error.code).toBe("invalid_credentials");
        expect(error.hasCode("invalid_credentials")).toBe(true);
        expect(error.hasCode("email_not_verified")).toBe(false);
    });

    it("leaves code undefined for errors without one", async () => {
        mockFetch(() => json(400, { detail: "Stock already in watchlist" }));

        await expect(addToWatchlist(7)).rejects.toMatchObject({ code: undefined });
    });

    it("keeps the backend's request id so failures can be traced in its logs", async () => {
        mockFetch(
            () =>
                new Response(JSON.stringify({ detail: "Internal Server Error" }), {
                    status: 500,
                    headers: { "X-Request-ID": "req-42" },
                }),
        );

        await expect(getWatchlist()).rejects.toMatchObject({ requestId: "req-42" });
    });
});

describe("error reporting", () => {
    it("reports server errors, unreachable servers and timeouts", async () => {
        mockFetch(() => json(500, {}));
        await getWatchlist().catch(() => {});

        mockFetch(() => {
            throw new TypeError("Failed to fetch");
        });
        await getWatchlist().catch(() => {});

        shortTimeouts();
        mockFetch(hang);
        await getWatchlist().catch(() => {});

        expect(vi.mocked(reportError).mock.calls.map(([error]) => error.name)).toEqual([
            "ApiError",
            "NetworkError",
            "TimeoutError",
        ]);
    });

    it("doesn't report expected errors like a wrong password", async () => {
        mockFetch(() => json(401, { detail: "Invalid email or password" }));

        await loginUser({ username: "a@b.c", password: "x" }).catch(() => {});
        expect(reportError).not.toHaveBeenCalled();
    });
});

describe("session expiry", () => {
    it("calls the handler when a refresh can't save the request", async () => {
        inBrowser();
        const onExpired = vi.fn();
        setSessionExpiredHandler(onExpired);
        mockFetch(() => json(401, {}));

        await getWatchlist().catch(() => {});
        expect(onExpired).toHaveBeenCalledTimes(1);
    });

    it("doesn't call it when the refresh works", async () => {
        inBrowser();
        const onExpired = vi.fn();
        setSessionExpiredHandler(onExpired);
        let watchlistCalls = 0;
        mockFetch((url) => {
            if (url === REFRESH_URL) return json(200, {});
            return ++watchlistCalls === 1 ? json(401, {}) : json(200, []);
        });

        await getWatchlist();
        expect(onExpired).not.toHaveBeenCalled();
    });

    it("doesn't call it for a wrong password or on the server", async () => {
        const onExpired = vi.fn();
        setSessionExpiredHandler(onExpired);
        mockFetch(() => json(401, {}));

        await getWatchlist().catch(() => {}); // server side: no window
        inBrowser();
        await loginUser({ username: "a@b.c", password: "x" }).catch(() => {});
        expect(onExpired).not.toHaveBeenCalled();
    });
});
