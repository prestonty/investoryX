import type { Simulation } from "./SimulatorClient";
import type {
    SimulatorDecisionResponse,
    SimulatorResponse,
    SimulatorTradeResponse,
} from "@/lib/api";
import type { Stock } from "@/components/simulator/StockWatchlist";
import type { TradeRecord } from "@/components/simulator/TradingActivityTable";

export function mapDecisions(
    decisions: SimulatorDecisionResponse[] | undefined,
): Record<string, SimulatorDecisionResponse> {
    return Object.fromEntries((decisions ?? []).map((d) => [d.ticker, d]));
}

export function mapTradeRecord(t: SimulatorTradeResponse): TradeRecord {
    return {
        id: String(t.trade_id),
        symbol: t.ticker,
        action: t.side.toUpperCase() as TradeRecord["action"],
        price: t.price,
        shares: t.shares,
        timestamp: new Date(t.executed_at ?? Date.now()),
        cashAfter: t.balance_after,
    };
}

// The simulator fields the server owns, for merging into a Simulation.
type SimulatorFields = Omit<Simulation, "id" | "name" | "stocks" | "trades" | "decisions">;

export function simulatorPatch(simulator: SimulatorResponse): SimulatorFields {
    return {
        starting_cash: simulator.starting_cash,
        cash_balance: simulator.cash_balance,
        status: simulator.status || "Active Trading",
        frequency: simulator.frequency || "daily",
        last_run_at: simulator.last_run_at ?? null,
        next_run_at: simulator.next_run_at ?? null,
        max_position_pct: simulator.max_position_pct ?? null,
        max_daily_loss_pct: simulator.max_daily_loss_pct ?? null,
        stopped_reason: simulator.stopped_reason ?? null,
        strategy_name: simulator.strategy_name || "sma_crossover",
        strategy_params: simulator.strategy_params ?? {},
    };
}

export function mapSimulatorToSimulation(
    simulator: SimulatorResponse,
    stocks: Stock[],
    trades: TradeRecord[],
    decisions: Record<string, SimulatorDecisionResponse> = {},
): Simulation {
    return {
        ...simulatorPatch(simulator),
        id: simulator.simulator_id,
        name: simulator.name,
        stocks,
        trades,
        decisions,
    };
}
