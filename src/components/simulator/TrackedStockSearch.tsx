"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import type { Item } from "@/types/item";
import type { Stock } from "@/components/simulator/StockWatchlist";
import { addTrackedStock, getStockPrice } from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";

interface TrackedStockSearchProps {
    simulatorId: number | null;
    existingSymbols: string[];
    onAddStock: (stock: Stock) => void;
    maxItems?: number;
    targetAllocation?: number;
}

const DEFAULT_MAX_ITEMS = 5;
const DEFAULT_TARGET_ALLOCATION = 25;

const parseNumber = (value: string | undefined) => {
    if (!value) return 0;
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
};

export function TrackedStockSearch({
    simulatorId,
    existingSymbols,
    onAddStock,
    maxItems = DEFAULT_MAX_ITEMS,
    targetAllocation = DEFAULT_TARGET_ALLOCATION,
}: TrackedStockSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Item[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const delayDebounce = setTimeout(() => {
            const handleSearch = async () => {
                const trimmed = query.trim();
                if (!trimmed) {
                    setResults([]);
                    return;
                }
                try {
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_URL}/api/stocks/search/${trimmed}`,
                        {
                            signal: controller.signal,
                        },
                    );
                    setResults(res.data);
                } catch (error) {
                    if (axios.isCancel(error)) {
                        return;
                    }
                    console.error("Search error:", error);
                }
            };

            handleSearch();
        }, 300);

        return () => {
            clearTimeout(delayDebounce);
            controller.abort();
        };
    }, [query]);

    const resolveTicker = (item?: Item) => {
        const candidate = item?.value ?? query.trim();
        if (!candidate) return null;
        return candidate.trim().toUpperCase();
    };

    const handleAddTicker = async (item?: Item) => {
        const ticker = resolveTicker(item);
        if (!ticker) return;

        if (!simulatorId) {
            toast.error("Create or load a simulator first.");
            return;
        }

        if (existingSymbols.some((symbol) => symbol === ticker)) {
            toast("Already in watchlist");
            return;
        }

        if (existingSymbols.length >= maxItems) {
            toast("Watchlist is full");
            return;
        }

        const token = await getTokenWithRefresh();
        if (!token) {
            toast.error("You must be logged in.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addTrackedStock(
                simulatorId,
                { ticker, target_allocation: targetAllocation },
                token,
            );
            let stock: Stock = {
                symbol: ticker,
                name: item?.label ?? ticker,
                price: 0,
                change: 0,
                changePercent: 0,
            };
            try {
                const basic = await getStockPrice(ticker);
                stock = {
                    symbol: ticker,
                    name: basic.companyName ?? stock.name,
                    price: parseNumber(basic.stockPrice),
                    change: parseNumber(basic.priceChange),
                    changePercent: parseNumber(basic.priceChangePercent),
                };
            } catch (priceError) {
                console.error("Price lookup failed:", priceError);
            }
            onAddStock(stock);
            setQuery("");
            setResults([]);
            toast.success(`${ticker} added to watchlist`);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to add tracked stock";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        handleAddTicker();
    };

    return (
        <div className="bg-white rounded-lg border border-light p-4 shadow-sm mb-4">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-[1] min-w-[140px] max-w-[200px] rounded-md border border-light px-3 py-2 text-sm text-dark placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-blue/40"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 rounded-md bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#6A84F5] transition-colors disabled:opacity-60"
                >
                    {isSubmitting ? "Adding..." : "Add"}
                </button>
            </form>
            {isFocused && results.length > 0 && (
                <div className="mt-3 space-y-2">
                    {results.slice(0, 5).map((item) => (
                        <button
                            key={`${item.value}-${item.label}`}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleAddTicker(item)}
                            className="w-full rounded-md border border-light px-3 py-2 text-left text-sm hover:bg-light/50 transition-colors"
                        >
                            <span className="font-medium text-dark">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
