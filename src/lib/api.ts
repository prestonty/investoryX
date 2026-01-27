// BFF

// Fetch stock history for candlestick charts
export async function getStockHistory(
    ticker: string,
    period: string = "1mo",
    interval: string = "1d",
) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`,
        {
            cache: "no-store",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch stock history");
    }

    return res.json();
}

// Fetch general stock information to populate stock page
export async function getStockPrice(ticker: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/stocks/${ticker}`, {
        cache: "no-store",
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
        cache: "no-store",
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
export async function getTopGainers(limit: number = 5) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/top-gainers?limit=${limit}`,
        {
            cache: "no-store",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch top gainers");
    }

    return res.json();
}

// Fetch top losers (stocks with highest percentage losses)
export async function getTopLosers(limit: number = 5) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/top-losers?limit=${limit}`,
        {
            cache: "no-store",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch top losers");
    }

    return res.json();
}

// Fetch most actively traded stocks (highest volume)
export async function getMostActive(limit: number = 5) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/most-active?limit=${limit}`,
        {
            cache: "no-store",
        },
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
            cache: "no-store",
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
            cache: "no-store",
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
            cache: "no-store",
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

export interface SimulatorResponse {
    simulator_id: number;
    user_id: number | null;
    name: string;
    starting_cash: number;
    cash_balance: number;
    created_at?: string;
    updated_at?: string;
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
}

export interface SimulatorCashLedgerResponse {
    ledger_id: number;
    simulator_id: number;
    delta: number;
    reason: string;
    balance_after: number;
    created_at?: string;
}

export interface SimulatorSummaryResponse {
    simulator: SimulatorResponse;
    tracked_stocks: SimulatorTrackedStockResponse[];
    positions: SimulatorPositionResponse[];
    trades: SimulatorTradeResponse[];
    cash_ledger: SimulatorCashLedgerResponse[];
}

export interface SimulatorRunResponse {
    message: string;
    trades_executed: number;
    cash_balance: number;
    price_mode: string;
    frequency: string;
}

export interface CreateSimulatorRequest {
    name: string;
    starting_cash: number;
}

export interface CreateTrackedStockRequest {
    ticker: string;
    target_allocation: number;
    enabled?: boolean;
}

export interface SimulatorRunRequest {
    price_mode?: "open" | "close";
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
        const error = await res.json();
        throw new Error(error.detail || "Registration failed");
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

// Login user and get access token
export async function loginUser(loginData: LoginData): Promise<AuthResponse> {
    // FastAPI OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new FormData();
    formData.append("username", loginData.username);
    formData.append("password", loginData.password);

    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/token`, {
        method: "POST",
        body: formData,
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to get user info");
    }

    return res.json();
}

// Watchlist
export async function addToWatchlist(
    stockId: number,
    token: string,
): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/watchlist/`, {
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
    return data;
}

export async function getWatchlistQuotes(
    token: string,
): Promise<WatchlistQuoteItem[]> {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/stocks/watchlist/quotes`;
    const res = await fetch(
        url,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        },
    );

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

export async function removeFromWatchlist(
    watchlistId: number,
    token: string,
): Promise<void> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/watchlist/${watchlistId}`,
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/simulator`, {
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

export async function listSimulators(
    token: string,
): Promise<SimulatorResponse[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/simulator`, {
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
    const res = await fetch(
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
    const res = await fetch(
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
    const res = await fetch(
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
    const res = await fetch(
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
    const res = await fetch(
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
    const res = await fetch(
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
