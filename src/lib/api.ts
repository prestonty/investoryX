// BFF

// FastAPI errors are {detail: string} or, for validation failures,
// {detail: [{msg: "Value error, ..."}]}. Returns a readable message or null.
export function errorDetail(body: unknown): string | null {
    const detail = (body as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        const messages = detail
            .map((item) => String((item as { msg?: unknown })?.msg ?? ""))
            .map((msg) => msg.replace(/^Value error, /, ""))
            .filter(Boolean);
        return messages.length ? messages.join("; ") : null;
    }
    return null;
}

const API_URL = process.env.NEXT_PUBLIC_URL;

// Public market data uses `next: { revalidate }` so the Next.js server reuses
// responses for a short time instead of hitting the API (and Yahoo) per view.

// Auth tokens live in httpOnly cookies that JavaScript can't read. In the
// browser, authenticated requests just send cookies; a 401 triggers one refresh
// (shared by all concurrent requests) and a single retry. On the Next.js server
// there are no browser cookies, so pages forward the access token explicitly
// as a Bearer header, which is kept only there.
let refreshInFlight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
    if (!refreshInFlight) {
        refreshInFlight = fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.ok)
            .catch(() => false)
            .finally(() => {
                refreshInFlight = null;
            });
    }
    return refreshInFlight;
}

export async function authFetch(
    url: string,
    init: RequestInit = {},
): Promise<Response> {
    const isBrowser = typeof window !== "undefined";
    const headers = new Headers(init.headers);
    if (isBrowser) headers.delete("Authorization");
    const request: RequestInit = { ...init, headers, credentials: "include" };

    const res = await fetch(url, request);
    if (res.status !== 401 || !isBrowser) return res;
    if (!(await refreshSession())) return res;
    return fetch(url, request);
}

export async function searchStocks(filterString: string, signal?: AbortSignal) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/stocks/search/${filterString}`,
        { signal, cache: "no-store" },
    );
    if (!res.ok) throw new Error("Failed to search stocks");
    return res.json();
}

export async function stockExist(ticker: string): Promise<{ exists: boolean }> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/stocks/exists/${ticker}`,
        { cache: "no-store" },
    );

    if (!res.ok) {
        throw new Error("Failed to check if ticker exists");
    }
    return res.json();
}

// Fetch stock history for candlestick charts
export async function getStockHistory(
    ticker: string,
    period: string = "1mo",
    interval: string = "1d",
) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`,
        {
            next: { revalidate: 60 },
        },
    );

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Failed to fetch stock history: ${res.status} ${res.statusText} — ${body}`,
        );
    }

    return res.json();
}

// Fetch general stock information to populate stock page
export async function getStockPrice(ticker: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/stocks/${ticker}`, {
        next: { revalidate: 30 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch basic stock data");
    }

    return res.json();
}

// Fetch stock information from database by ticker (includes stock_id)
export async function getStockInfo(ticker: string) {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/stocks/ticker/${ticker}`;
    const res = await fetch(url, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        const details = {
            url,
            status: res.status,
            statusText: res.statusText,
            body,
        };
        console.error("getStockInfo failed:", JSON.stringify(details));
        throw new Error("Failed to fetch stock info");
    }

    return res.json();
}

// MARKET MOVERS API FUNCTIONS

// Fetch top gainers (stocks with highest percentage gains)
export async function getTopGainers(limit: number = 8, minPrice: number = 4.0) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/top-gainers?limit=${limit}&min_price=${minPrice}`,
        { next: { revalidate: 60 } },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch top gainers");
    }

    return res.json();
}

// Fetch top losers (stocks with highest percentage losses)
export async function getTopLosers(limit: number = 8, minPrice: number = 4.0) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/top-losers?limit=${limit}&min_price=${minPrice}`,
        { next: { revalidate: 60 } },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch top losers");
    }

    return res.json();
}

// Fetch most actively traded stocks (highest volume)
export async function getMostActive(limit: number = 8, minPrice: number = 4.0) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/most-active?limit=${limit}&min_price=${minPrice}`,
        { next: { revalidate: 60 } },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch most active stocks");
    }

    return res.json();
}

// Fetch stock news
export async function getStockNews(maxArticles: number = 20) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-news?max_articles=${maxArticles}`,
        {
            next: { revalidate: 300 },
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch stock news");
    }

    return res.json();
}

// Fetch default market indexes/ETFs
export async function getDefaultIndexes() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/get-default-indexes`,
        {
            next: { revalidate: 30 },
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch default indexes");
    }

    return res.json();
}

export async function getStockOverview(ticker: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-overview/${ticker}`,
        {
            next: { revalidate: 300 },
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch advanced stock data");
    }

    return res.json();
}

// AUTH API FUNCTIONS

export interface RegisterData {
    Name: string;
    email: string;
    password: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    user_id: number;
    name: string;
    email: string;
    is_active: boolean;
}

export interface WatchlistQuoteItem {
    watchlist_id: number;
    stock_id: number;
    user_id: number;
    ticker: string;
    company_name: string;
    stockPrice: number | null;
    priceChange: number | null;
    priceChangePercent: number | null;
    error: string | null;
}

export interface WatchlistItemResponse {
    watchlist_id: number;
    stock_id: number;
    user_id: number;
}

export interface SimulatorResponse {
    simulator_id: number;
    user_id: number | null;
    name: string;
    starting_cash: number;
    cash_balance: number;
    status: "Active Trading" | "Pause Trading";
    frequency: "daily" | "twice_daily";
    last_run_at?: string;
    next_run_at?: string;
    max_position_pct?: number | null;
    max_daily_loss_pct?: number | null;
    stopped_reason?: string | null;
    strategy_name: string;
    // Every setting of strategy_name, with defaults filled in.
    strategy_params: StrategyParams;
    created_at?: string;
    updated_at?: string;
    tickers: string[];
}

export interface SimulatorTrackedStockResponse {
    tracked_id: number;
    simulator_id: number;
    ticker: string;
    target_allocation: number;
    enabled: boolean;
}

export interface SimulatorPositionResponse {
    position_id: number;
    simulator_id: number;
    ticker: string;
    shares: number;
    avg_cost: number;
}

export interface SimulatorTradeResponse {
    trade_id: number;
    simulator_id: number;
    ticker: string;
    side: string;
    price: number;
    shares: number;
    fee: number;
    executed_at?: string;
    source?: string;
    balance_after?: number;
}

export interface SimulatorCashLedgerResponse {
    ledger_id: number;
    simulator_id: number;
    delta: number;
    reason: string;
    balance_after: number;
    created_at?: string;
}

// The strategy's latest decision for one tracked stock, and what became of it.
export interface SimulatorDecisionResponse {
    ticker: string;
    action: "buy" | "sell" | "hold";
    quantity: number;
    reason: string;
    // pending = waiting for the next open; executed/skipped/failed after that.
    status: "pending" | "executed" | "skipped" | "failed";
    execution_error?: string | null;
    for_day?: string | null;
    created_at?: string | null;
}

export interface SimulatorSummaryResponse {
    simulator: SimulatorResponse;
    tracked_stocks: SimulatorTrackedStockResponse[];
    positions: SimulatorPositionResponse[];
    trades: SimulatorTradeResponse[];
    cash_ledger: SimulatorCashLedgerResponse[];
    decisions: SimulatorDecisionResponse[];
}

export interface SimulatorRunResponse {
    message: string;
    // Fills of the previous trading day's orders, at today's open.
    trades_executed: number;
    // Orders decided on today's close, filling at the next trading day's open.
    orders_queued: number;
    cash_balance: number;
    frequency: string;
}

export interface CreateSimulatorRequest {
    name: string;
    starting_cash: number;
}

export type StrategyName =
    | "sma_crossover"
    | "sma_50_200_crossover"
    | "stat_arb_pairs"
    | "auction_liquidity_provider";

export type StrategyParamValue = number | string | null;
export type StrategyParams = Record<string, StrategyParamValue>;

export interface StrategyParamSpec {
    name: string;
    label: string;
    type: "integer" | "number" | "ticker";
    default: StrategyParamValue;
    min?: number;
    max?: number;
    min_exclusive?: boolean;
    max_exclusive?: boolean;
}

export interface StrategyOption {
    value: StrategyName;
    label: string;
    params: StrategyParamSpec[];
}

export interface UpdateSimulatorSettingsRequest {
    frequency?: "daily" | "twice_daily";
    max_position_pct?: number | null;
    max_daily_loss_pct?: number | null;
    strategy_name?: StrategyName;
    // Replaces the saved settings; omitted keys use the strategy's defaults.
    strategy_params?: StrategyParams;
}

export interface CreateTrackedStockRequest {
    ticker: string;
    target_allocation: number;
    enabled?: boolean;
}

export interface SimulatorRunRequest {
    frequency?: "daily" | "twice_daily";
}

// Register a new user
export async function registerUser(
    userData: RegisterData,
): Promise<UserResponse> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(errorDetail(error) || "Registration failed");
    }

    const user = await res.json();

    // Backend already sends verification email during registration
    // No need to send another one from frontend
    return user;
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ message: string }> {
    const res = await fetch(
        `${
            process.env.NEXT_PUBLIC_URL
        }/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        {
            method: "GET",
        },
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Email verification failed");
    }

    return res.json();
}

// Request a password reset email. The response is the same whether or not
// an account exists for the email.
export async function requestPasswordReset(
    email: string,
): Promise<{ message: string }> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/forgot-password`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(
            errorDetail(error) || "Could not send reset email. Please try again.",
        );
    }

    return res.json();
}

// Set a new password using the token from a reset email
export async function resetPassword(
    token: string,
    password: string,
): Promise<{ message: string }> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/reset-password`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
            credentials: "include", // the API clears any old session cookies
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(errorDetail(error) || "Password reset failed");
    }

    return res.json();
}

// Login user and get access token
export async function loginUser(loginData: LoginData): Promise<AuthResponse> {
    // FastAPI OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new FormData();
    formData.append("username", loginData.username);
    formData.append("password", loginData.password);

    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/token`, {
        method: "POST",
        body: formData,
        credentials: "include", // the API sets the httpOnly auth cookies
    });

    if (!res.ok) {
        const error = await res.json();

        // Check for specific email verification error
        if (error.detail && error.detail.includes("Email not verified")) {
            throw new Error(
                "Email not verified. A new verification email has been sent to your inbox.",
            );
        }

        throw new Error(error.detail || "Login failed");
    }

    return res.json();
}

// Get current user info (requires token)
export async function getCurrentUser(token: string): Promise<UserResponse> {
    const res = await authFetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const error = new Error(errorDetail(body) || "Failed to get user info") as Error & {
            status?: number;
        };
        error.status = res.status;
        throw error;
    }

    return res.json();
}

// Watchlist
export async function addToWatchlist(
    stockId: number,
    token: string,
): Promise<WatchlistItemResponse> {
    const res = await authFetch(`${process.env.NEXT_PUBLIC_URL}/api/watchlist/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock_id: stockId }),
    });

    const data = await res.json().catch(() => null); // read once
    if (!res.ok) {
        const msg = data?.detail ?? data?.message ?? `Failed: ${res.status}`;
        throw new Error(msg); // <-- carries "Stock already in watchlist"
    }
    return data as WatchlistItemResponse;
}

export async function getWatchlist(
    token: string,
): Promise<WatchlistItemResponse[]> {
    const res = await authFetch(`${process.env.NEXT_PUBLIC_URL}/api/watchlist/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = data?.detail ?? data?.message ?? `Failed: ${res.status}`;
        throw new Error(msg);
    }
    return data as WatchlistItemResponse[];
}

export async function getWatchlistQuotes(
    token: string,
): Promise<WatchlistQuoteItem[]> {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/stocks/watchlist/quotes`;
    const res = await authFetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        const message = body || "Failed to fetch watchlist quotes";
        console.error(
            "getWatchlistQuotes failed:",
            JSON.stringify({
                url,
                status: res.status,
                statusText: res.statusText,
                body,
            }),
        );
        const error = new Error(message) as Error & { status?: number };
        error.status = res.status;
        throw error;
    }

    return res.json();
}

// Each user has at most one row per stock, so stock_id identifies it
export async function removeFromWatchlist(
    stockId: number,
    token: string,
): Promise<void> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/watchlist/by-stock/${stockId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.detail ?? data?.message ?? "Failed to remove item";
        throw new Error(msg);
    }
}

// Simulator
export async function createSimulator(
    payload: CreateSimulatorRequest,
    token: string,
): Promise<SimulatorResponse> {
    const res = await authFetch(`${process.env.NEXT_PUBLIC_URL}/api/simulator`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to create simulator");
    }

    return res.json();
}

export async function renameSimulator(
    simulatorId: number,
    name: string,
    token: string,
): Promise<SimulatorResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/rename/${simulatorId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to rename simulator");
    }

    return res.json();
}

export async function updateSimulatorSettings(
    simulatorId: number,
    payload: UpdateSimulatorSettingsRequest,
    token: string,
): Promise<SimulatorResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/settings`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to update simulator settings");
    }

    return res.json();
}

export async function listSimulators(
    token: string,
): Promise<SimulatorResponse[]> {
    const res = await authFetch(`${process.env.NEXT_PUBLIC_URL}/api/simulator`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to load simulators");
    }

    return res.json();
}

export async function addTrackedStock(
    simulatorId: number,
    payload: CreateTrackedStockRequest,
    token: string,
): Promise<SimulatorTrackedStockResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/tracked-stocks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to add tracked stock");
    }

    return res.json();
}

export async function deleteTrackedStock(
    simulatorId: number,
    trackedId: number,
    token: string,
): Promise<void> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/tracked-stocks/${trackedId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to remove tracked stock");
    }
}

export async function deleteTrackedStockByTicker(
    simulatorId: number,
    ticker: string,
    token: string,
): Promise<void> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/tracked-stocks/by-ticker/${ticker}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to remove tracked stock");
    }
}

export async function deleteSimulator(
    simulatorId: number,
    token: string,
): Promise<void> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to delete simulator");
    }
}

export async function getSimulatorSummary(
    simulatorId: number,
    token: string,
): Promise<SimulatorSummaryResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to load simulator summary");
    }

    return res.json();
}

export async function runSimulator(
    simulatorId: number,
    payload: SimulatorRunRequest,
    token: string,
): Promise<SimulatorRunResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/run`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to run simulator");
    }

    return res.json();
}

export async function getDevFlags(): Promise<{ dev_mode: boolean }> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/dev/flags`, {
            cache: "no-store",
        });
        if (!res.ok) return { dev_mode: false };
        return res.json();
    } catch {
        return { dev_mode: false };
    }
}

export async function getStrategies(): Promise<StrategyOption[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/strategies`, {
        cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
}

// ---------------------------------------------------------------------------
// Trading Sandbox (Backtest)
// ---------------------------------------------------------------------------

export interface BacktestRequest {
    start_date: string; // ISO "YYYY-MM-DD"
    end_date: string;
    clear_previous?: boolean;
}

export interface BacktestDayResult {
    day: string;
    signals_generated: number;
    trades_executed: number;
    cash_after: number;
    skipped_tickers: string[];
}

export interface BacktestResult {
    simulator_id: number;
    start_date: string;
    end_date: string;
    trading_days_run: number;
    total_trades: number;
    starting_cash: number;
    final_cash: number;
    /** Market value of shares still held at end_date. */
    holdings_value?: number;
    /** final_cash + holdings_value; pnl is measured against this. */
    final_equity?: number;
    pnl: number;
    pnl_pct: number;
    day_results: BacktestDayResult[];
    warnings: string[];
}

export interface BacktestLaunchResponse {
    task_id: string;
    message: string;
}

export interface BacktestStatusResponse {
    task_id: string;
    status: "pending" | "running" | "success" | "failure";
    result?: BacktestResult;
    error?: string;
}

export async function launchBacktest(
    simulatorId: number,
    payload: BacktestRequest,
    token: string,
): Promise<BacktestLaunchResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/backtest`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
    );
    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to launch backtest");
    }
    return res.json();
}

export async function getBacktestStatus(
    simulatorId: number,
    taskId: string,
    token: string,
): Promise<BacktestStatusResponse> {
    const res = await authFetch(
        `${process.env.NEXT_PUBLIC_URL}/api/simulator/${simulatorId}/backtest/status/${taskId}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        },
    );
    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to get backtest status");
    }
    return res.json();
}

export async function runPipeline(token: string, day?: string) {
    const url = new URL(`${process.env.NEXT_PUBLIC_URL}/dev/run-pipeline`);
    if (day) url.searchParams.set("day", day);
    const res = await authFetch(url.toString(), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to run pipeline");
    }
    return res.json();
}
