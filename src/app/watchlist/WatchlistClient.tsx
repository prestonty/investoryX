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

type SortMode = "ticker" | "change";

function sortItems(items: WatchlistQuoteItem[], sortMode: SortMode) {
    const sorted = [...items];
    if (sortMode === "ticker") {
        sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
        return sorted;
    }

    sorted.sort((a, b) => {
        const aValue = a.priceChangePercent ?? Number.NEGATIVE_INFINITY;
        const bValue = b.priceChangePercent ?? Number.NEGATIVE_INFINITY;
        return bValue - aValue;
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
        setSortMode((prev) => (prev === "ticker" ? "change" : "ticker"));
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
                options={[]}
                onChange={() => {}}
                onSelect={handleAddFromSearch}
            />
            <div className="flex justify-between items-center">
                <p className="text-dark font-medium">
                    {items.length} {items.length === 1 ? "item" : "items"}
                </p>
                <button
                    type="button"
                    onClick={handleToggleSort}
                    className="text-sm px-4 py-2 rounded-full border border-dark text-dark hover:bg-dark hover:text-white transition-all"
                >
                    Sort: {sortMode === "ticker" ? "Ticker" : "Change %"}
                </button>
            </div>

            {sortedItems.length === 0 ? (
                <div className="text-dark text-center py-8">
                    Your watchlist is empty.
                </div>
            ) : (
                <div className="flex flex-col gap-y-6">
                    {sortedItems.map((item, index) => (
                        <div key={item.watchlist_id}>
                            <StockWatchItem
                                item={item}
                                onRemove={handleRemove}
                                isRemoving={
                                    isPending && pendingId === item.watchlist_id
                                }
                            />
                            {index < sortedItems.length - 1 && <hr className="my-4" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
