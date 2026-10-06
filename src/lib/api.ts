// BFF

const API_URL = process.env.NEXT_PUBLIC_URL;

// An API request that failed; `status` is the HTTP status (0 if unreachable).
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

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

// Auth tokens live in httpOnly cookies that JavaScript can't read, so browser
// requests just send cookies; for endpoints that need a session, a 401 triggers
// one refresh (shared by all concurrent requests) and a single retry. On the
// Next.js server there are no browser cookies, so server pages pass the access
// cookie's value as `token` and it's forwarded as a Bearer header.
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

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    // Sent as JSON, or as-is when it's FormData.
    body?: unknown;
    // Message used when the API doesn't explain the failure.
    error?: string;
    // The endpoint needs a session: refresh and retry once on a 401.
    auth?: boolean;
    // Server-side only: the access token to forward.
    token?: string;
    // Public market data sets `revalidate` so the Next.js server reuses
    // responses for a while instead of hitting the API (and Yahoo) per view.
    revalidate?: number;
    signal?: AbortSignal;
}

// T defaults to any for the untyped market-data endpoints (they were before too).
async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, auth = false, token, revalidate, signal } = options;
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const isForm = body instanceof FormData;
    if (body !== undefined && !isForm) headers.set("Content-Type", "application/json");

    const init: RequestInit & { next?: { revalidate: number } } = {
        method,
        headers,
        body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
        credentials: "include",
        signal,
        ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" }),
    };

    const url = `${API_URL}${path}`;
    let res = await fetch(url, init);
    if (res.status === 401 && auth && typeof window !== "undefined") {
        if (await refreshSession()) res = await fetch(url, init);
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new ApiError(
            errorDetail(data) ?? options.error ?? `Request failed (${res.status})`,
            res.status,
        );
    }
    return data as T;
}

const enc = encodeURIComponent;

export function searchStocks(filterString: string, signal?: AbortSignal) {
    return request(`/api/stocks/search/${enc(filterString)}`, {
        signal,
        error: "Failed to search stocks",
    });
}

export function stockExist(ticker: string): Promise<{ exists: boolean }> {
    return request(`/api/stocks/exists/${enc(ticker)}`, {
        error: "Failed to check if ticker exists",
    });
}

// Fetch stock history for candlestick charts
export function getStockHistory(
    ticker: string,
    period: string = "1mo",
    interval: string = "1d",
) {
    return request(
        `/stock-history/${enc(ticker)}?period=${enc(period)}&interval=${enc(interval)}`,
        { revalidate: 60, error: "Failed to fetch stock history" },
    );
}

// Fetch general stock information to populate stock page
export function getStockPrice(ticker: string) {
    return request(`/stocks/${enc(ticker)}`, {
        revalidate: 30,
        error: "Failed to fetch basic stock data",
    });
}

// Fetch stock information from database by ticker (includes stock_id)
export function getStockInfo(ticker: string) {
    return request(`/api/stocks/ticker/${enc(ticker)}`, {
        revalidate: 3600,
        error: "Failed to fetch stock info",
    });
}

// MARKET MOVERS API FUNCTIONS

// Fetch top gainers (stocks with highest percentage gains)
export function getTopGainers(limit: number = 8, minPrice: number = 4.0) {
    return request(`/top-gainers?limit=${limit}&min_price=${minPrice}`, {
        revalidate: 60,
        error: "Failed to fetch top gainers",
    });
}

// Fetch top losers (stocks with highest percentage losses)
export function getTopLosers(limit: number = 8, minPrice: number = 4.0) {
    return request(`/top-losers?limit=${limit}&min_price=${minPrice}`, {
        revalidate: 60,
        error: "Failed to fetch top losers",
    });
}

// Fetch most actively traded stocks (highest volume)
export function getMostActive(limit: number = 8, minPrice: number = 4.0) {
    return request(`/most-active?limit=${limit}&min_price=${minPrice}`, {
        revalidate: 60,
        error: "Failed to fetch most active stocks",
    });
}

// Fetch stock news
export function getStockNews(maxArticles: number = 20) {
    return request(`/stock-news?max_articles=${maxArticles}`, {
        revalidate: 300,
        error: "Failed to fetch stock news",
    });
}

// Fetch default market indexes/ETFs
export function getDefaultIndexes() {
    return request(`/get-default-indexes`, {
        revalidate: 30,
        error: "Failed to fetch default indexes",
    });
}

export function getStockOverview(ticker: string) {
    return request(`/stock-overview/${enc(ticker)}`, {
        revalidate: 300,
        error: "Failed to fetch advanced stock data",
    });
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

// Register a new user. The backend sends the verification email.
export function registerUser(userData: RegisterData): Promise<UserResponse> {
    return request("/api/auth/register", {
        method: "POST",
        body: userData,
        error: "Registration failed",
    });
}

// Verify email with token
export function verifyEmail(token: string): Promise<{ message: string }> {
    return request(`/api/auth/verify-email?token=${enc(token)}`, {
        error: "Email verification failed",
    });
}

// Request a password reset email. The response is the same whether or not
// an account exists for the email.
export function requestPasswordReset(email: string): Promise<{ message: string }> {
    return request("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
        error: "Could not send reset email. Please try again.",
    });
}

// Set a new password using the token from a reset email
// (the API also clears any old session cookies).
export function resetPassword(
    token: string,
    password: string,
): Promise<{ message: string }> {
    return request("/api/auth/reset-password", {
        method: "POST",
        body: { token, password },
        error: "Password reset failed",
    });
}

// Log in; the API sets the httpOnly auth cookies.
export async function loginUser(loginData: LoginData): Promise<AuthResponse> {
    // FastAPI OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new FormData();
    formData.append("username", loginData.username);
    formData.append("password", loginData.password);

    try {
        return await request("/api/auth/token", {
            method: "POST",
            body: formData,
            error: "Login failed",
        });
    } catch (error) {
        if (error instanceof ApiError && error.message.includes("Email not verified")) {
            throw new ApiError(
                "Email not verified. A new verification email has been sent to your inbox.",
                error.status,
            );
        }
        throw error;
    }
}

// Watchlist

export function addToWatchlist(stockId: number): Promise<WatchlistItemResponse> {
    return request("/api/watchlist/", {
        method: "POST",
        body: { stock_id: stockId },
        auth: true,
        error: "Failed to add to watchlist",
    });
}

export function getWatchlist(): Promise<WatchlistItemResponse[]> {
    return request("/api/watchlist/", { auth: true, error: "Failed to load watchlist" });
}

// `token` is for the server-rendered watchlist page; the browser uses cookies.
export function getWatchlistQuotes(token?: string): Promise<WatchlistQuoteItem[]> {
    return request("/api/stocks/watchlist/quotes", {
        auth: true,
        token,
        error: "Failed to fetch watchlist quotes",
    });
}

// Each user has at most one row per stock, so stock_id identifies it
export async function removeFromWatchlist(stockId: number): Promise<void> {
    await request(`/api/watchlist/by-stock/${stockId}`, {
        method: "DELETE",
        auth: true,
        error: "Failed to remove item",
    });
}

// Simulator

export function createSimulator(
    payload: CreateSimulatorRequest,
): Promise<SimulatorResponse> {
    return request("/api/simulator", {
        method: "POST",
        body: payload,
        auth: true,
        error: "Failed to create simulator",
    });
}

export function renameSimulator(
    simulatorId: number,
    name: string,
): Promise<SimulatorResponse> {
    return request(`/api/simulator/rename/${simulatorId}`, {
        method: "PATCH",
        body: { name },
        auth: true,
        error: "Failed to rename simulator",
    });
}

export function updateSimulatorSettings(
    simulatorId: number,
    payload: UpdateSimulatorSettingsRequest,
): Promise<SimulatorResponse> {
    return request(`/api/simulator/${simulatorId}/settings`, {
        method: "PATCH",
        body: payload,
        auth: true,
        error: "Failed to update simulator settings",
    });
}

export function listSimulators(): Promise<SimulatorResponse[]> {
    return request("/api/simulator", { auth: true, error: "Failed to load simulators" });
}

export function addTrackedStock(
    simulatorId: number,
    payload: CreateTrackedStockRequest,
): Promise<SimulatorTrackedStockResponse> {
    return request(`/api/simulator/${simulatorId}/tracked-stocks`, {
        method: "POST",
        body: payload,
        auth: true,
        error: "Failed to add tracked stock",
    });
}

export async function deleteTrackedStock(
    simulatorId: number,
    trackedId: number,
): Promise<void> {
    await request(`/api/simulator/${simulatorId}/tracked-stocks/${trackedId}`, {
        method: "DELETE",
        auth: true,
        error: "Failed to remove tracked stock",
    });
}

export async function deleteSimulator(simulatorId: number): Promise<void> {
    await request(`/api/simulator/${simulatorId}`, {
        method: "DELETE",
        auth: true,
        error: "Failed to delete simulator",
    });
}

export function getSimulatorSummary(
    simulatorId: number,
): Promise<SimulatorSummaryResponse> {
    return request(`/api/simulator/${simulatorId}`, {
        auth: true,
        error: "Failed to load simulator summary",
    });
}

export function runSimulator(
    simulatorId: number,
    payload: SimulatorRunRequest,
): Promise<SimulatorRunResponse> {
    return request(`/api/simulator/${simulatorId}/run`, {
        method: "POST",
        body: payload,
        auth: true,
        error: "Failed to run simulator",
    });
}

export function getDevFlags(): Promise<{ dev_mode: boolean }> {
    return request<{ dev_mode: boolean }>("/dev/flags").catch(() => ({ dev_mode: false }));
}

export function getStrategies(): Promise<StrategyOption[]> {
    return request<StrategyOption[]>("/api/strategies").catch(() => []);
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

export function launchBacktest(
    simulatorId: number,
    payload: BacktestRequest,
): Promise<BacktestLaunchResponse> {
    return request(`/api/simulator/${simulatorId}/backtest`, {
        method: "POST",
        body: payload,
        auth: true,
        error: "Failed to launch backtest",
    });
}

export function getBacktestStatus(
    simulatorId: number,
    taskId: string,
): Promise<BacktestStatusResponse> {
    return request(`/api/simulator/${simulatorId}/backtest/status/${enc(taskId)}`, {
        auth: true,
        error: "Failed to get backtest status",
    });
}

export function runPipeline(day?: string) {
    const query = day ? `?day=${enc(day)}` : "";
    return request(`/dev/run-pipeline${query}`, {
        method: "POST",
        auth: true,
        error: "Failed to run pipeline",
    });
}
