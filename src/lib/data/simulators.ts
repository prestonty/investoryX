// One simulator API for both kinds of user: logged-in users go through the
// backend, guests through localStorage (plus a read-only demo simulator).
// Running, backtesting and summaries need the backend, so they stay in lib/api.

import {
    addTrackedStock,
    createSimulator,
    deleteSimulator,
    deleteTrackedStock,
    getSimulatorSummary,
    getStockPrice,
    listSimulators,
    renameSimulator,
    updateSimulatorSettings,
    type UpdateSimulatorSettingsRequest,
} from "@/lib/api";
import {
    addGuestSimulator,
    deleteGuestSimulator,
    getGuestSimulators,
    updateGuestSimulator,
    type GuestSimulator,
} from "@/lib/guestStorage";
import { DEMO_SIMULATION } from "@/lib/demoSimulator";
import { parseNumber } from "@/lib/utils/helper";
import type { Simulation } from "@/app/simulator/SimulatorClient";
import {
    mapDecisions,
    mapSimulatorToSimulation,
    mapTradeRecord,
    simulatorPatch,
} from "@/app/simulator/mappers";
import type { Stock } from "@/components/simulator/StockWatchlist";
import type { TradeRecord } from "@/components/simulator/TradingActivityTable";

export interface SimulatorStore {
    list(): Promise<Simulation[]>;
    create(): Promise<Simulation>;
    rename(id: number, name: string): Promise<void>;
    // Returns the fields to merge into the simulation.
    updateSettings(
        simulation: Simulation,
        payload: UpdateSimulatorSettingsRequest,
    ): Promise<Partial<Simulation>>;
    remove(id: number): Promise<void>;
    // Returns the tracked-stock id (null for guests, who have none).
    addTrackedStock(
        simulatorId: number,
        ticker: string,
        targetAllocation: number,
    ): Promise<number | null>;
    removeTrackedStock(simulatorId: number, stock: Stock): Promise<void>;
}

const NEW_SIMULATOR = { name: "My Simulator", starting_cash: 10000 };

async function fetchStockWithPrice(
    ticker: string,
    trackedId: number | null,
): Promise<Stock> {
    let companyName = ticker;
    let price = 0;
    let change = 0;
    let changePercent = 0;
    try {
        const basic = await getStockPrice(ticker);
        companyName = basic.companyName ?? companyName;
        price = parseNumber(basic.stockPrice);
        change = parseNumber(basic.priceChange);
        changePercent = parseNumber(basic.priceChangePercent);
    } catch (priceError) {
        console.error("Price lookup failed:", priceError);
    }
    return { symbol: ticker, companyName, trackedId, price, change, changePercent };
}

const remoteSimulators: SimulatorStore = {
    async list() {
        const simulators = await listSimulators();
        return Promise.all(
            simulators.map(async (simulator) => {
                let stocks: Stock[] = [];
                let trades: TradeRecord[] = [];
                let decisions: Simulation["decisions"] = {};
                try {
                    const summary = await getSimulatorSummary(simulator.simulator_id);
                    trades = (summary.trades ?? []).map(mapTradeRecord);
                    decisions = mapDecisions(summary.decisions);
                    stocks = await Promise.all(
                        (summary.tracked_stocks ?? []).map((ts) =>
                            fetchStockWithPrice(ts.ticker, ts.tracked_id ?? null),
                        ),
                    );
                } catch (summaryError) {
                    console.error("Summary lookup failed:", summaryError);
                }
                return mapSimulatorToSimulation(simulator, stocks, trades, decisions);
            }),
        );
    },
    async create() {
        const simulator = await createSimulator(NEW_SIMULATOR);
        return mapSimulatorToSimulation(simulator, [], []);
    },
    async rename(id, name) {
        await renameSimulator(id, name);
    },
    async updateSettings(simulation, payload) {
        return simulatorPatch(await updateSimulatorSettings(simulation.id, payload));
    },
    async remove(id) {
        await deleteSimulator(id);
    },
    async addTrackedStock(simulatorId, ticker, targetAllocation) {
        const tracked = await addTrackedStock(simulatorId, {
            ticker,
            target_allocation: targetAllocation,
        });
        return tracked.tracked_id ?? null;
    },
    async removeTrackedStock(simulatorId, stock) {
        if (!stock.trackedId) throw new Error("No tracked stock id found for this item.");
        await deleteTrackedStock(simulatorId, stock.trackedId);
    },
};

// Guest simulators are keyed by a UUID in localStorage; the UI needs a numeric
// id, so derive a stable positive one (real ids are server-assigned, the demo is -1).
function localIdToInt(localId: string): number {
    const hex = localId.replace(/-/g, "").slice(-8);
    return Math.abs(parseInt(hex, 16)) + 1;
}

function findGuestSimulator(id: number): GuestSimulator | undefined {
    return getGuestSimulators().find((sim) => localIdToInt(sim.local_id) === id);
}

function guestSimToSimulation(sim: GuestSimulator): Simulation {
    return {
        id: localIdToInt(sim.local_id),
        name: sim.name,
        cash_balance: sim.starting_cash,
        starting_cash: sim.starting_cash,
        status: "Pause Trading",
        frequency: sim.frequency,
        strategy_name: sim.strategy_name,
        strategy_params: sim.strategy_params ?? {},
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
        decisions: {},
    };
}

const localSimulators: SimulatorStore = {
    async list() {
        return [DEMO_SIMULATION, ...getGuestSimulators().map(guestSimToSimulation)];
    },
    async create() {
        const draft: GuestSimulator = {
            local_id: crypto.randomUUID(),
            ...NEW_SIMULATOR,
            status: "draft",
            frequency: "daily",
            strategy_name: "sma_crossover",
            max_position_pct: null,
            max_daily_loss_pct: null,
            tracked_tickers: [],
            created_at: new Date().toISOString(),
        };
        addGuestSimulator(draft);
        return guestSimToSimulation(draft);
    },
    async rename(id, name) {
        const sim = findGuestSimulator(id);
        if (sim) updateGuestSimulator(sim.local_id, { name });
    },
    async updateSettings(simulation, payload) {
        // Mirror the server: switching strategy without new params resets to defaults.
        const strategyChanged =
            !!payload.strategy_name && payload.strategy_name !== simulation.strategy_name;
        const strategyParams =
            payload.strategy_params ?? (strategyChanged ? {} : undefined);
        const sim = findGuestSimulator(simulation.id);
        if (sim) {
            updateGuestSimulator(sim.local_id, {
                ...(payload.frequency && { frequency: payload.frequency }),
                ...(payload.strategy_name && { strategy_name: payload.strategy_name }),
                ...(strategyParams && { strategy_params: strategyParams }),
                ...("max_position_pct" in payload && {
                    max_position_pct: payload.max_position_pct ?? null,
                }),
                ...("max_daily_loss_pct" in payload && {
                    max_daily_loss_pct: payload.max_daily_loss_pct ?? null,
                }),
            });
        }
        return {
            ...payload,
            ...(strategyParams && { strategy_params: strategyParams }),
        } as Partial<Simulation>;
    },
    async remove(id) {
        const sim = findGuestSimulator(id);
        if (sim) deleteGuestSimulator(sim.local_id);
    },
    async addTrackedStock(simulatorId, ticker) {
        const sim = findGuestSimulator(simulatorId);
        if (sim && !sim.tracked_tickers.includes(ticker)) {
            updateGuestSimulator(sim.local_id, {
                tracked_tickers: [...sim.tracked_tickers, ticker],
            });
        }
        return null;
    },
    async removeTrackedStock(simulatorId, stock) {
        const sim = findGuestSimulator(simulatorId);
        if (sim) {
            updateGuestSimulator(sim.local_id, {
                tracked_tickers: sim.tracked_tickers.filter((t) => t !== stock.symbol),
            });
        }
    },
};

export function getSimulatorStore(isAuthenticated: boolean): SimulatorStore {
    return isAuthenticated ? remoteSimulators : localSimulators;
}
