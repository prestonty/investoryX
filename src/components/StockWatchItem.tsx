"use client";

import type { WatchlistQuoteItem } from "@/lib/api";

function formatPrice(value: number | null) {
    if (value === null || Number.isNaN(value)) {
        return "N/A";
    }
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatChange(value: number | null) {
    if (value === null || Number.isNaN(value)) {
        return "N/A";
    }
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
}

function formatPercent(value: number | null) {
    if (value === null || Number.isNaN(value)) {
        return "N/A";
    }
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
}

export default function StockWatchItem({
    item,
    onRemove,
    isRemoving,
}: {
    item: WatchlistQuoteItem;
    onRemove: (watchlistId: number) => void;
    isRemoving: boolean;
}) {
    const isPositive = (item.priceChange ?? 0) >= 0;
    const changePillClass = isPositive
        ? "bg-lightgreen text-light"
        : "bg-red text-white";

    return (
        <div className="flex flex-col text-dark gap-y-2">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">{item.ticker}</p>
                <div className="flex items-center gap-x-3">
                    <p>{formatPrice(item.stockPrice)}</p>
                    <button
                        type="button"
                        onClick={() => onRemove(item.watchlist_id)}
                        disabled={isRemoving}
                        className="text-sm px-3 py-1 rounded-full border border-dark text-dark hover:bg-dark hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    Watchlist item #{item.watchlist_id}
                </p>
                <div
                    className={`${changePillClass} rounded-[16px] py-2 px-4 min-w-[7.5rem] text-center`}
                >
                    {item.error ? (
                        <p className="text-sm font-medium">Quote error</p>
                    ) : (
                        <p className="font-medium">
                            {formatChange(item.priceChange)} (
                            {formatPercent(item.priceChangePercent)})
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
