import { FaArrowDown, FaArrowUp, FaTrashAlt } from "react-icons/fa";

export interface Stock {
  symbol: string;
  companyName: string;
  trackedId: number | null;
  price: number;
  change: number;
  changePercent: number;
}

interface StockWatchlistProps {
  stocks: Stock[];
  onRemove?: (trackedId: number | null, symbol: string) => void;
}

export function StockWatchlist({ stocks, onRemove }: StockWatchlistProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-light shadow-sm">
      <h3 className="text-dark mb-3">Watchlist ({stocks.length}/5)</h3>
      <div className="space-y-2">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-light/30 rounded-lg p-3 flex items-center justify-between hover:bg-light/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-dark font-medium">{stock.symbol}</span>
                {stock.change >= 0 ? (
                  <FaArrowUp className="size-4 text-green" />
                ) : (
                  <FaArrowDown className="size-4 text-red" />
                )}
              </div>
              <span className="text-xs text-gray">{stock.companyName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
              <div className="text-dark font-medium">${stock.price.toFixed(2)}</div>
              <div
                className={`text-xs ${
                  stock.change >= 0 ? 'text-green' : 'text-red'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%
              </div>
              </div>
              {onRemove && (
                <button
                  type="button"
                  aria-label={`Remove ${stock.symbol} from watchlist`}
                  onClick={() => onRemove(stock.trackedId, stock.symbol)}
                  className="rounded-md border border-transparent p-2 text-gray hover:text-red hover:bg-white transition-colors"
                >
                  <FaTrashAlt className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {stocks.length === 0 && (
          <div className="text-center py-8 text-gray">
            No stocks in watchlist
          </div>
        )}
      </div>
    </div>
  );
}
