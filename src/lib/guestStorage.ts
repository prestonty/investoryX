// Guest mode localStorage persistence
// All data stored here is local-only and migrated to the backend on first login.

export interface GuestWatchlistItem {
    local_id: string;
    ticker: string;
    company_name: string;
    stock_id: number;
    added_at: string; // ISO timestamp
}

interface GuestWatchlistStore {
    version: 1;
    items: GuestWatchlistItem[];
}

export interface GuestSimulator {
    local_id: string;
    name: string;
    starting_cash: number;
    status: "draft";
    frequency: "daily" | "twice_daily";
    price_mode: "open" | "close";
    strategy_name: string;
    max_position_pct: number | null;
    max_daily_loss_pct: number | null;
    tracked_tickers: string[];
    created_at: string; // ISO timestamp
}

interface GuestSimulatorStore {
    version: 1;
    simulators: GuestSimulator[];
}

const WATCHLIST_KEY = "investoryx_guest_watchlist";
const SIMULATOR_KEY = "investoryx_guest_simulator";

// --- Watchlist ---

function readWatchlistStore(): GuestWatchlistStore {
    if (typeof window === "undefined") return { version: 1, items: [] };
    try {
        const raw = localStorage.getItem(WATCHLIST_KEY);
        if (!raw) return { version: 1, items: [] };
        return JSON.parse(raw) as GuestWatchlistStore;
    } catch {
        return { version: 1, items: [] };
    }
}

function writeWatchlistStore(store: GuestWatchlistStore): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(store));
}

export function getGuestWatchlist(): GuestWatchlistItem[] {
    return readWatchlistStore().items;
}

export function addGuestWatchlistItem(item: GuestWatchlistItem): void {
    const store = readWatchlistStore();
    if (store.items.some((i) => i.ticker === item.ticker)) return; // dedup
    store.items.push(item);
    writeWatchlistStore(store);
}

export function removeGuestWatchlistItem(localId: string): void {
    const store = readWatchlistStore();
    store.items = store.items.filter((i) => i.local_id !== localId);
    writeWatchlistStore(store);
}

export function clearGuestWatchlist(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(WATCHLIST_KEY);
}

// --- Simulator ---

function readSimulatorStore(): GuestSimulatorStore {
    if (typeof window === "undefined") return { version: 1, simulators: [] };
    try {
        const raw = localStorage.getItem(SIMULATOR_KEY);
        if (!raw) return { version: 1, simulators: [] };
        return JSON.parse(raw) as GuestSimulatorStore;
    } catch {
        return { version: 1, simulators: [] };
    }
}

function writeSimulatorStore(store: GuestSimulatorStore): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(SIMULATOR_KEY, JSON.stringify(store));
}

export function getGuestSimulators(): GuestSimulator[] {
    return readSimulatorStore().simulators;
}

export function addGuestSimulator(sim: GuestSimulator): void {
    const store = readSimulatorStore();
    store.simulators.push(sim);
    writeSimulatorStore(store);
}

export function updateGuestSimulator(
    localId: string,
    patch: Partial<GuestSimulator>,
): void {
    const store = readSimulatorStore();
    store.simulators = store.simulators.map((s) =>
        s.local_id === localId ? { ...s, ...patch } : s,
    );
    writeSimulatorStore(store);
}

export function deleteGuestSimulator(localId: string): void {
    const store = readSimulatorStore();
    store.simulators = store.simulators.filter((s) => s.local_id !== localId);
    writeSimulatorStore(store);
}

export function clearGuestSimulators(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SIMULATOR_KEY);
}

export function hasGuestData(): boolean {
    return (
        getGuestWatchlist().length > 0 || getGuestSimulators().length > 0
    );
}
