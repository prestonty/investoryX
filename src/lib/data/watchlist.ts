// One watchlist API for both kinds of user: logged-in users go through the
// backend, guests through localStorage. A stock appears at most once per
// watchlist, so stock_id identifies an entry everywhere.

import {
    addToWatchlist,
    getStockPrice,
    getWatchlist,
    getWatchlistQuotes,
    removeFromWatchlist,
    type WatchlistQuoteItem,
} from "@/lib/api";
import {
    addGuestWatchlistItem,
    getGuestWatchlist,
    removeGuestWatchlistItemByStock,
} from "@/lib/guestStorage";

export interface WatchlistStock {
    stock_id: number;
    ticker: string;
    company_name: string;
}

// What the watchlist page shows; the server's row ids aren't needed.
export type WatchlistQuote = Omit<WatchlistQuoteItem, "watchlist_id" | "user_id">;

export interface WatchlistStore {
    contains(stockId: number): Promise<boolean>;
    listQuotes(): Promise<WatchlistQuote[]>;
    add(stock: WatchlistStock): Promise<void>;
    remove(stockId: number): Promise<void>;
}

const remoteWatchlist: WatchlistStore = {
    async contains(stockId) {
        const items = await getWatchlist();
        return items.some((item) => item.stock_id === stockId);
    },
    async listQuotes() {
        return getWatchlistQuotes();
    },
    async add(stock) {
        await addToWatchlist(stock.stock_id);
    },
    async remove(stockId) {
        await removeFromWatchlist(stockId);
    },
};

const localWatchlist: WatchlistStore = {
    async contains(stockId) {
        return getGuestWatchlist().some((item) => item.stock_id === stockId);
    },
    async listQuotes() {
        const items = getGuestWatchlist();
        const prices = await Promise.allSettled(
            items.map((item) => getStockPrice(item.ticker)),
        );
        return items.map((item, i) => {
            const price = prices[i].status === "fulfilled" ? prices[i].value : null;
            return {
                stock_id: item.stock_id,
                ticker: item.ticker,
                company_name: item.company_name,
                stockPrice: price?.stockPrice ?? null,
                priceChange: price?.priceChange ?? null,
                priceChangePercent: price?.priceChangePercent ?? null,
                error: null,
            };
        });
    },
    async add(stock) {
        addGuestWatchlistItem({
            ...stock,
            local_id: crypto.randomUUID(),
            added_at: new Date().toISOString(),
        });
    },
    async remove(stockId) {
        removeGuestWatchlistItemByStock(stockId);
    },
};

export function getWatchlistStore(isAuthenticated: boolean): WatchlistStore {
    return isAuthenticated ? remoteWatchlist : localWatchlist;
}
