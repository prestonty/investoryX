// Migrates guest localStorage data to the backend after the user logs in.
// Called once after setAuthToken() on successful login.

import {
    addToWatchlist,
    createSimulator,
    addTrackedStock,
    updateSimulatorSettings,
    type StrategyName,
} from "./api";
import {
    getGuestWatchlist,
    getGuestSimulators,
    clearGuestWatchlist,
    clearGuestSimulators,
    hasGuestData,
} from "./guestStorage";

export { hasGuestData };

async function migrateWatchlist(token: string): Promise<void> {
    const items = getGuestWatchlist();
    if (items.length === 0) return;

    await Promise.allSettled(
        items.map((item) => addToWatchlist(item.stock_id, token)),
    );
    clearGuestWatchlist();
}

async function migrateSimulators(token: string): Promise<void> {
    const simulators = getGuestSimulators();
    if (simulators.length === 0) return;

    for (const sim of simulators) {
        try {
            const created = await createSimulator(
                { name: sim.name, starting_cash: sim.starting_cash },
                token,
            );
            const simId = created.simulator_id;

            // Add tracked stocks
            await Promise.allSettled(
                sim.tracked_tickers.map((ticker) =>
                    addTrackedStock(simId, { ticker, target_allocation: 0 }, token),
                ),
            );

            // Migrate settings
            await updateSimulatorSettings(
                simId,
                {
                    frequency: sim.frequency,
                    price_mode: sim.price_mode,
                    strategy_name: sim.strategy_name as StrategyName,
                    max_position_pct: sim.max_position_pct,
                    max_daily_loss_pct: sim.max_daily_loss_pct,
                },
                token,
            );
        } catch (e) {
            console.error("Failed to migrate simulator:", sim.name, e);
        }
    }
    clearGuestSimulators();
}

export async function migrateGuestData(token: string): Promise<void> {
    await migrateWatchlist(token);
    await migrateSimulators(token);
}
