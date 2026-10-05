import { FaArrowDown, FaArrowUp, FaTrashAlt } from "react-icons/fa";
import type { SimulatorDecisionResponse } from "@/lib/api";

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
  // Latest strategy decision per ticker.
  decisions?: Record<string, SimulatorDecisionResponse>;
  onRemove?: (trackedId: number | null, symbol: string) => void;
}

const ACTION_STYLES: Record<SimulatorDecisionResponse["action"], string> = {
  buy: "bg-green/10 text-green",
  sell: "bg-red/10 text-red",
  hold: "bg-light text-gray",
};

// What happened to a buy/sell order; holds have nothing to execute.
function orderOutcome(decision: SimulatorDecisionResponse): string | null {
  if (decision.action === "hold") return null;
  switch (decision.status) {
    case "pending":
      return "Queued for next open";
    case "executed":
      return "Filled";
    case "failed":
      return `Not filled: ${decision.execution_error ?? "unknown reason"}`;
    case "skipped":
      return decision.execution_error?.startsWith("expired")
        ? "Expired"
        : `Skipped: ${decision.execution_error ?? "unknown reason"}`;
  }
}

function DecisionLine({ decision }: { decision?: SimulatorDecisionResponse }) {
  if (!decision) {
    return (
      <p className="mt-1 text-[11px] text-gray">
        No decision yet. The strategy runs after each market close.
      </p>
    );
  }
  const outcome = orderOutcome(decision);
  const quantity = decision.action === "hold" ? "" : ` ${Number(decision.quantity)}`;
  return (
    <div className="mt-1 text-[11px] leading-snug">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded px-1.5 py-0.5 font-semibold uppercase ${ACTION_STYLES[decision.action]}`}
        >
          {decision.action}
          {quantity}
        </span>
        {outcome && (
          <span className={decision.status === "failed" ? "text-red" : "text-dark"}>
            {outcome}
          </span>
        )}
        {decision.for_day && <span className="text-gray">· {decision.for_day}</span>}
      </div>
      <p className="mt-0.5 text-gray">{decision.reason}</p>
    </div>
  );
}

export function StockWatchlist({ stocks, decisions = {}, onRemove }: StockWatchlistProps) {
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
              <DecisionLine decision={decisions[stock.symbol]} />
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
