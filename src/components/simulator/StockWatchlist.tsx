import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockWatchlistProps {
  stocks: Stock[];
}

export function StockWatchlist({ stocks }: StockWatchlistProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-[#E8EBED] shadow-sm">
      <h3 className="text-[#181D2A] mb-3">Watchlist ({stocks.length}/5)</h3>
      <div className="space-y-2">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-[#E8EBED]/30 rounded-lg p-3 flex items-center justify-between hover:bg-[#E8EBED]/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[#181D2A] font-medium">{stock.symbol}</span>
                {stock.change >= 0 ? (
                  <FaArrowUp className="size-4 text-[#248E4F]" />
                ) : (
                  <FaArrowDown className="size-4 text-[#DF3F30]" />
                )}
              </div>
              <span className="text-xs text-[#7E8391]">{stock.name}</span>
            </div>
            <div className="text-right">
              <div className="text-[#181D2A] font-medium">${stock.price.toFixed(2)}</div>
              <div
                className={`text-xs ${
                  stock.change >= 0 ? 'text-[#248E4F]' : 'text-[#DF3F30]'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
        {stocks.length === 0 && (
          <div className="text-center py-8 text-[#7E8391]">
            No stocks in watchlist
          </div>
        )}
      </div>
    </div>
  );
}
