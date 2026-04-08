"use client";

import { useMemo, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";

import Searchbar from "@/components/Searchbar";
import StockWatchItem from "@/components/StockWatchItem";
import type { WatchlistQuoteItem } from "@/lib/api";
import {
    addToWatchlist,
    getStockInfo,
    getWatchlistQuotes,
    removeFromWatchlist,
} from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";

type SortMode = "ticker" | "change-desc" | "change-asc";

const SORT_CYCLE: SortMode[] = ["ticker", "change-desc", "change-asc"];
const SORT_LABELS: Record<SortMode, string> = {
    "ticker": "A–Z",
    "change-desc": "Change ▼",
    "change-asc": "Change ▲",
};

function sortItems(items: WatchlistQuoteItem[], sortMode: SortMode) {
    const sorted = [...items];
    if (sortMode === "ticker") {
        sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
        return sorted;
    }

    sorted.sort((a, b) => {
        const aValue = a.priceChangePercent ?? Number.NEGATIVE_INFINITY;
        const bValue = b.priceChangePercent ?? Number.NEGATIVE_INFINITY;
        return sortMode === "change-desc" ? bValue - aValue : aValue - bValue;
    });
    return sorted;
}

export default function WatchlistClient({
    initialItems,
}: {
    initialItems: WatchlistQuoteItem[];
}) {
    const [items, setItems] = useState<WatchlistQuoteItem[]>(initialItems);
    const [sortMode, setSortMode] = useState<SortMode>("ticker");
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    const sortedItems = useMemo(
        () => sortItems(items, sortMode),
        [items, sortMode],
    );

    const handleToggleSort = () => {
        setSortMode((prev) => {
            const idx = SORT_CYCLE.indexOf(prev);
            return SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
        });
    };

    const handleRemove = (watchlistId: number) => {
        startTransition(async () => {
            try {
                setPendingId(watchlistId);
                const token = await getTokenWithRefresh();
                if (!token) {
                    toast.error("You must be logged in.");
                    return;
                }

                await removeFromWatchlist(watchlistId, token);
                setItems((prev) =>
                    prev.filter((item) => item.watchlist_id !== watchlistId),
                );
                toast.success("Removed from watchlist");
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to remove item";
                toast.error(message);
            } finally {
                setPendingId(null);
            }
        });
    };

    const handleAddFromSearch = (item: { value: string; label: string }) => {
        startTransition(async () => {
            try {
                const token = await getTokenWithRefresh();
                if (!token) {
                    toast.error("You must be logged in.");
                    return;
                }

                const stock = await getStockInfo(item.value);
                await addToWatchlist(stock.stock_id, token);
                const refreshed = await getWatchlistQuotes(token);
                setItems(refreshed);
                toast.success("Added to watchlist");
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to add item";
                toast.error(message);
            }
        });
    };

    return (
        <div className="flex flex-col gap-y-6">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#fff",
                        color: "#181D2A",
                    },
                }}
            />

            <Searchbar
                placeholder="Add to Watchlist"
                options={[]}
                onChange={() => {}}
                onSelect={handleAddFromSearch}
            />

            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-x-2">
                    <span className="text-dark font-semibold text-sm">Holdings</span>
                    <span className="text-xs font-semibold bg-blue/10 text-blue px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleToggleSort}
                    className="flex items-center gap-x-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-light text-gray hover:border-blue hover:text-blue transition-all"
                >
                    <span>Sort:</span>
                    <span className="font-semibold">{SORT_LABELS[sortMode]}</span>
                </button>
            </div>

            {sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-y-2 text-center">
                    <p className="text-dark font-semibold">Your watchlist is empty</p>
                    <p className="text-gray text-sm">Search above to add your first stock.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {sortedItems.map((item) => (
                        <StockWatchItem
                            key={item.watchlist_id}
                            item={item}
                            onRemove={handleRemove}
                            isRemoving={isPending && pendingId === item.watchlist_id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
