"use client";

import type { WatchlistQuoteItem } from "@/lib/api";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { formatPrice, formatChange, formatPercent } from "@/lib/utils/helper";

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
    const changeColor = item.error
        ? "text-gray"
        : isPositive
          ? "text-lightgreen"
          : "text-red";
    const stockHref = `/stock/${item.ticker.toLowerCase()}`;

    return (
        <div className="flex items-center justify-between gap-x-4 px-4 py-3 rounded-xl hover:bg-light transition-colors group">
            <Link href={stockHref} className="flex flex-col gap-y-0.5 min-w-0">
                <span className="font-bold text-blue text-base leading-tight truncate">
                    {item.ticker}
                </span>
                <span className="text-xs text-gray truncate">{item.company_name}</span>
            </Link>

            <div className="flex items-center gap-x-4 shrink-0">
                <div className="text-right">
                    <p className="font-bold text-dark text-lg leading-tight">
                        {formatPrice(item.stockPrice)}
                    </p>
                    <p className={`text-xs font-semibold ${changeColor}`}>
                        {item.error
                            ? "Quote error"
                            : `${formatChange(item.priceChange)} (${formatPercent(item.priceChangePercent)})`}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(item.watchlist_id)}
                    disabled={isRemoving}
                    aria-label={`Remove ${item.ticker} from watchlist`}
                    className="p-2 rounded-full text-gray hover:text-red hover:bg-red/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaTrash className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
