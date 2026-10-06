"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";

import GuestBanner from "@/components/GuestBanner";
import Searchbar from "@/components/Searchbar";
import StockWatchItem from "@/components/StockWatchItem";
import { getStockInfo } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getWatchlistStore, type WatchlistQuote } from "@/lib/data/watchlist";

type SortMode = "ticker" | "change-desc" | "change-asc";

const SORT_CYCLE: SortMode[] = ["ticker", "change-desc", "change-asc"];
const SORT_LABELS: Record<SortMode, string> = {
    "ticker": "A–Z",
    "change-desc": "Change ▼",
    "change-asc": "Change ▲",
};

function sortItems(items: WatchlistQuote[], sortMode: SortMode) {
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
    loadOnClient = false,
}: {
    initialItems: WatchlistQuote[];
    // Set when the server couldn't load the watchlist (e.g. the short-lived
    // access cookie expired); the browser request refreshes the session first.
    loadOnClient?: boolean;
}) {
    const { status, isAuthenticated } = useAuth();
    const store = getWatchlistStore(isAuthenticated);
    const [items, setItems] = useState<WatchlistQuote[]>(initialItems);
    const [sortMode, setSortMode] = useState<SortMode>("ticker");
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    // The server renders a logged-in user's watchlist; load it here for guests,
    // or when the server couldn't.
    useEffect(() => {
        if (status === "loading") return;
        if (isAuthenticated && !loadOnClient) return;
        store
            .listQuotes()
            .then(setItems)
            .catch((error) => {
                if ((error as { status?: number })?.status === 401) {
                    window.location.href = "/login?redirectTo=/watchlist";
                } else {
                    console.error("Failed to load watchlist quotes:", error);
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, loadOnClient]);

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

    const handleRemove = (stockId: number) => {
        startTransition(async () => {
            try {
                setPendingId(stockId);
                await store.remove(stockId);
                setItems((prev) => prev.filter((item) => item.stock_id !== stockId));
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
                if (items.some((i) => i.ticker === item.value)) {
                    toast("Already in watchlist");
                    return;
                }
                const stock = await getStockInfo(item.value);
                await store.add({
                    stock_id: stock.stock_id,
                    ticker: item.value,
                    company_name: item.label,
                });
                setItems(await store.listQuotes());
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

            <GuestBanner />

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
                            key={item.stock_id}
                            item={item}
                            onRemove={handleRemove}
                            isRemoving={isPending && pendingId === item.stock_id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
