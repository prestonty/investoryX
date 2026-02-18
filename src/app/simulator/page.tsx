import { cookies } from "next/headers";
import SimulatorClient, { type Simulation } from "./SimulatorClient";
import { getSimulatorSummary, getStockPrice, listSimulators } from "@/lib/api";
import { parseNumber } from "@/lib/utils/helper";
import { useEffect } from "react";

export default async function SimulatorPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return <SimulatorClient initialSimulations={[]} initialActiveSimulationId={null} />;
    }

    try {
        const simulators = await listSimulators(token);
        const mapped: Simulation[] = await Promise.all(
            simulators.map(async (simulator): Promise<Simulation> => {
                let stocks: Simulation["stocks"] = [];
                try {
                    const summary = await getSimulatorSummary(
                        simulator.simulator_id,
                        token,
                    );
                    const tracked = summary.tracked_stocks ?? [];
                    stocks = await Promise.all(
                        tracked.map(async (trackedStock) => {
                            let companyName = trackedStock.ticker;
                            let price = 0;
                            let change = 0;
                            let changePercent = 0;
                            try {
                                const basic = await getStockPrice(trackedStock.ticker);
                                companyName = basic.companyName ?? companyName;
                                price = parseNumber(basic.stockPrice);
                                change = parseNumber(basic.priceChange);
                                changePercent = parseNumber(basic.priceChangePercent);
                            } catch (priceError) {
                                console.error("Price lookup failed:", priceError);
                            }
                            return {
                                symbol: trackedStock.ticker,
                                companyName,
                                trackedId: trackedStock.tracked_id ?? null,
                                price,
                                change,
                                changePercent,
                            };
                        }),
                    );
                } catch (summaryError) {
                    console.error("Summary lookup failed:", summaryError);
                }
                return {
                    id: simulator.simulator_id,
                    name: simulator.name,
                    starting_cash: simulator.starting_cash,
                    cash_balance: simulator.cash_balance,
                    status: simulator.status || "Active Trading",
                    frequency: simulator.frequency || "daily",
                    price_mode: simulator.price_mode || "close",
                    last_run_at: simulator.last_run_at ?? null,
                    next_run_at: simulator.next_run_at ?? null,
                    max_position_pct: simulator.max_position_pct ?? null,
                    max_daily_loss_pct: simulator.max_daily_loss_pct ?? null,
                    stopped_reason: simulator.stopped_reason ?? null,
                    stocks,
                    trades: [],
                };
            }),
        );

        return (
            <SimulatorClient
                initialSimulations={mapped}
                initialActiveSimulationId={mapped[0]?.id ?? null}
            />
        );
    } catch (error) {
        console.error("Failed to load simulators:", error);
        return <SimulatorClient initialSimulations={[]} initialActiveSimulationId={null} />;
    }
}
