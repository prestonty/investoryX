import type { Simulation } from "./SimulatorClient";
import type { GuestSimulator } from "@/lib/guestStorage";
import type { SimulatorResponse, SimulatorTradeResponse } from "@/lib/api";
import type { Stock } from "@/components/simulator/StockWatchlist";
import type { TradeRecord } from "@/components/simulator/TradingActivityTable";

/**
 * Derives a stable positive integer ID from a UUID.
 * Used so guest simulators have unique numeric IDs that don't
 * conflict with real simulator IDs (which are positive server-assigned ints).
 * We use a large offset to avoid accidental collisions.
 */
function localIdToInt(localId: string): number {
    const hex = localId.replace(/-/g, "").slice(-8);
    return Math.abs(parseInt(hex, 16)) + 1;
}

export function guestSimToSimulation(
    sim: GuestSimulator,
): Simulation & { _localId: string } {
    return {
        id: localIdToInt(sim.local_id),
        name: sim.name,
        cash_balance: sim.starting_cash,
        starting_cash: sim.starting_cash,
        status: "Pause Trading",
        frequency: sim.frequency,
        price_mode: sim.price_mode,
        strategy_name: sim.strategy_name,
        last_run_at: null,
        next_run_at: null,
        max_position_pct: sim.max_position_pct,
        max_daily_loss_pct: sim.max_daily_loss_pct,
        stopped_reason: null,
        stocks: sim.tracked_tickers.map((ticker) => ({
            symbol: ticker,
            companyName: ticker,
            trackedId: null,
            price: 0,
            change: 0,
            changePercent: 0,
        })),
        trades: [],
        _localId: sim.local_id,
    };
}

export function mapTradeRecord(t: SimulatorTradeResponse): TradeRecord {
    return {
        id: String(t.trade_id),
        symbol: t.ticker,
        action: t.side.toUpperCase() as TradeRecord["action"],
        price: t.price,
        volume: t.shares,
        timestamp: new Date(t.executed_at ?? Date.now()),
        cashAfter: t.balance_after,
    };
}

export function mapSimulatorToSimulation(
    simulator: SimulatorResponse,
    stocks: Stock[],
    trades: TradeRecord[],
): Simulation {
    return {
        id: simulator.simulator_id,
        name: simulator.name,
        starting_cash: simulator.starting_cash,
        cash_balance: simulator.cash_balance,
        status: simulator.status || "Active Trading",
        frequency: simulator.frequency || "daily",
        price_mode: simulator.price_mode || "close",
        last_run_at: simulator.last_run_at,
        next_run_at: simulator.next_run_at,
        max_position_pct: simulator.max_position_pct ?? null,
        max_daily_loss_pct: simulator.max_daily_loss_pct ?? null,
        stopped_reason: simulator.stopped_reason ?? null,
        strategy_name: simulator.strategy_name || "sma_crossover",
        stocks,
        trades,
    };
}
