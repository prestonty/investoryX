"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";

import GuestBanner from "@/components/GuestBanner";
import Searchbar from "@/components/Searchbar";
import StockWatchItem from "@/components/StockWatchItem";
import type { WatchlistQuoteItem } from "@/lib/api";
import {
    addToWatchlist,
    getStockInfo,
    getStockPrice,
    getWatchlistQuotes,
    removeFromWatchlist,
} from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";
import { useGuest } from "@/contexts/GuestContext";
import {
    addGuestWatchlistItem,
    getGuestWatchlist,
    removeGuestWatchlistItem,
    type GuestWatchlistItem,
} from "@/lib/guestStorage";

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

// Derive a stable unique negative integer from a UUID so guest items
// have distinct watchlist_id values for React keys and remove lookups.
function localIdToNegInt(localId: string): number {
    const hex = localId.replace(/-/g, "").slice(-8);
    return -(parseInt(hex, 16) + 1);
}

function guestItemToQuoteItem(item: GuestWatchlistItem): WatchlistQuoteItem {
    return {
        watchlist_id: localIdToNegInt(item.local_id),
        stock_id: item.stock_id,
        user_id: 0,
        ticker: item.ticker,
        company_name: item.company_name,
        stockPrice: null,
        priceChange: null,
        priceChangePercent: null,
        error: null,
        // Store local_id as an extension so handleRemove can find it
        _local_id: item.local_id,
    } as WatchlistQuoteItem & { _local_id: string };
}

export default function WatchlistClient({
    initialItems,
}: {
    initialItems: WatchlistQuoteItem[];
}) {
    const { isGuest } = useGuest();
    const [items, setItems] = useState<WatchlistQuoteItem[]>(initialItems);
    const [sortMode, setSortMode] = useState<SortMode>("ticker");
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    // Load guest watchlist from localStorage on mount and fetch prices
    useEffect(() => {
        if (!isGuest) return;
        const stored = getGuestWatchlist();
        setItems(stored.map(guestItemToQuoteItem));

        if (stored.length === 0) return;
        Promise.allSettled(stored.map((item) => getStockPrice(item.ticker))).then(
            (results) => {
                setItems((prev) =>
                    prev.map((item, i) => {
                        const result = results[i];
                        if (result.status === "fulfilled") {
                            return {
                                ...item,
                                stockPrice: result.value.stockPrice ?? null,
                                priceChange: result.value.priceChange ?? null,
                                priceChangePercent: result.value.priceChangePercent ?? null,
                            };
                        }
                        return item;
                    }),
                );
            },
        );
    }, [isGuest]);

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

                if (isGuest) {
                    // Find the local_id for this guest item
                    const target = items.find(
                        (i) => i.watchlist_id === watchlistId,
                    ) as (WatchlistQuoteItem & { _local_id?: string }) | undefined;
                    const localId = target?._local_id ?? String(watchlistId);
                    removeGuestWatchlistItem(localId);
                    setItems((prev) =>
                        prev.filter((item) => item.watchlist_id !== watchlistId),
                    );
                    toast.success("Removed from watchlist");
                    return;
                }

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
                if (isGuest) {
                    const [stock, priceData] = await Promise.all([
                        getStockInfo(item.value),
                        getStockPrice(item.value).catch(() => null),
                    ]);
                    const guestItem: GuestWatchlistItem = {
                        local_id: crypto.randomUUID(),
                        ticker: item.value,
                        company_name: item.label,
                        stock_id: stock.stock_id,
                        added_at: new Date().toISOString(),
                    };
                    addGuestWatchlistItem(guestItem);
                    setItems((prev) => {
                        if (prev.some((i) => i.ticker === item.value)) return prev;
                        return [
                            ...prev,
                            {
                                ...guestItemToQuoteItem(guestItem),
                                stockPrice: priceData?.stockPrice ?? null,
                                priceChange: priceData?.priceChange ?? null,
                                priceChangePercent: priceData?.priceChangePercent ?? null,
                            },
                        ];
                    });
                    toast.success("Added to watchlist");
                    return;
                }

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

            {isGuest && <GuestBanner />}

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
