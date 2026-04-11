import { useEffect } from "react";
import toast from "react-hot-toast";
import { getTokenWithRefresh } from "@/lib/auth";
import { useGuest } from "@/contexts/GuestContext";
import { listSimulators, getSimulatorSummary, getStockPrice } from "@/lib/api";
import { parseNumber } from "@/lib/utils/helper";
import type { Stock } from "@/components/simulator/StockWatchlist";
import type { TradeRecord } from "@/components/simulator/TradingActivityTable";
import type { Simulation } from "./SimulatorClient";
import { mapTradeRecord, mapSimulatorToSimulation } from "./mappers";

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

async function fetchAllSimulators(token: string): Promise<Simulation[]> {
    const simulators = await listSimulators(token);
    return Promise.all(
        simulators.map(async (simulator) => {
            let stocks: Stock[] = [];
            let trades: TradeRecord[] = [];
            try {
                const summary = await getSimulatorSummary(simulator.simulator_id, token);
                trades = (summary.trades ?? []).map(mapTradeRecord);
                stocks = await Promise.all(
                    (summary.tracked_stocks ?? []).map((ts) =>
                        fetchStockWithPrice(ts.ticker, ts.tracked_id ?? null),
                    ),
                );
            } catch (summaryError) {
                console.error("Summary lookup failed:", summaryError);
            }
            return mapSimulatorToSimulation(simulator, stocks, trades);
        }),
    );
}

interface UseLoadSimulatorsParams {
    hasInitialSimulations: boolean;
    setSimulations: (simulations: Simulation[]) => void;
    setActiveSimulation: (simulation: Simulation | null) => void;
    setLoading: (loading: boolean) => void;
}

export function useLoadSimulators({
    hasInitialSimulations,
    setSimulations,
    setActiveSimulation,
    setLoading,
}: UseLoadSimulatorsParams) {
    const { isGuest } = useGuest();
    useEffect(() => {
        if (hasInitialSimulations || isGuest) return;
        let isMounted = true;

        const load = async () => {
            const token = await getTokenWithRefresh();
            if (!token) {
                toast.error("You must be logged in.");
                if (isMounted) setLoading(false);
                return;
            }
            try {
                const simulations = await fetchAllSimulators(token);
                if (!isMounted) return;
                setSimulations(simulations);
                setActiveSimulation(simulations.length > 0 ? simulations[0] : null);
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to load simulators";
                toast.error(message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, [hasInitialSimulations]);
}
