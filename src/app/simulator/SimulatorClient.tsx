"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import {
    createSimulator,
    renameSimulator,
    updateSimulatorSettings,
    deleteSimulator,
    getStockPrice,
    getSimulatorSummary,
    deleteTrackedStock,
    listSimulators,
    runSimulator,
    type SimulatorResponse,
    type UpdateSimulatorSettingsRequest,
    type SimulatorSummaryResponse,
} from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";
import {
  parseNumber,
  formatCurrency,
  formatPercentage,
  formatDateTime,
} from "@/lib/utils/helper";

import { SimulationTabs } from '@/components/simulator/SimulationTabs';
import { RobotTrader } from '@/components/simulator/RobotTrader';
import { StockWatchlist, Stock } from '@/components/simulator/StockWatchlist';
import { TrackedStockSearch } from '@/components/simulator/TrackedStockSearch';
import { TradingActivityTable, TradeRecord } from '@/components/simulator/TradingActivityTable';
import { TradingActivityGraph } from '@/components/simulator/TradingActivityGraph';
import Dropdown from "@/components/Dropdown";
import { FaChartBar } from "react-icons/fa";
import { GoTable } from "react-icons/go";

export interface Simulation {
  id: number;
  name: string;
  cash_balance: number;
  starting_cash: number;
  status: "Active Trading" | "Pause Trading";
  frequency: "daily" | "twice_daily";
  price_mode: "open" | "close";
  last_run_at?: string | null;
  next_run_at?: string | null;
  max_position_pct?: number | null;
  max_daily_loss_pct?: number | null;
  stopped_reason?: string | null;
  stocks: Stock[];
  trades: TradeRecord[];
}

const MAX_SIMULATIONS = 3;

interface SimulatorClientProps {
  initialSimulations?: Simulation[];
  initialActiveSimulationId?: number | null;
}

type EditableRiskField = "max_daily_loss_pct" | "max_position_pct";

export default function SimulatorClient({
  initialSimulations = [],
  initialActiveSimulationId = null,
}: SimulatorClientProps) {
    const [summary, setSummary] = useState<SimulatorSummaryResponse | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
    const [editingRiskField, setEditingRiskField] = useState<EditableRiskField | null>(null);
    const [riskDraft, setRiskDraft] = useState("");

    const [simulations, setSimulations] = useState<Simulation[]>(initialSimulations);
    const [activeSimulation, setActiveSimulation] = useState<Simulation | null>(() => {
      if (initialSimulations.length === 0) return null;
      if (initialActiveSimulationId !== null) {
        return (
          initialSimulations.find((sim) => sim.id === initialActiveSimulationId) ??
          initialSimulations[0]
        );
      }
      return initialSimulations[0];
    });
    const activeSimulationId = activeSimulation?.id ?? null;
    const hasInitialSimulations = initialSimulations.length > 0;

    useEffect(() => {
      if (!activeSimulationId) {
        if (activeSimulation) {
          setActiveSimulation(null);
        }
        return;
      }
      const refreshed = simulations.find((sim) => sim.id === activeSimulationId) ?? null;
      if (!refreshed) {
        setActiveSimulation(null);
        return;
      }
      if (refreshed !== activeSimulation) {
        setActiveSimulation(refreshed);
      }
    }, [simulations, activeSimulationId, activeSimulation]);

    const requireToken = async () => {
        const token = await getTokenWithRefresh();
        if (!token) {
            toast.error("You must be logged in.");
            return null;
        }
        return token;
    };

    const updateSimulationFromResponse = (simulator: SimulatorResponse) => {
      const patch: Partial<Simulation> = {
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
      };
      setSimulations((prev) =>
        prev.map((sim) => (sim.id === simulator.simulator_id ? { ...sim, ...patch } : sim)),
      );
    };

    const persistSimulatorSettings = async (
      payload: UpdateSimulatorSettingsRequest,
      successMessage?: string,
    ) => {
      if (!activeSimulationId) return false;
      const token = await requireToken();
      if (!token) return false;

      try {
        const updated = await updateSimulatorSettings(activeSimulationId, payload, token);
        updateSimulationFromResponse(updated);
        if (successMessage) {
          toast.success(successMessage);
        }
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update simulator settings";
        toast.error(message);
        return false;
      }
    };

    const beginRiskEdit = (field: EditableRiskField) => {
      if (!activeSimulation) return;
      setEditingRiskField(field);
      const currentValue = activeSimulation[field];
      setRiskDraft(currentValue === null || currentValue === undefined ? "" : String(currentValue));
    };

    const cancelRiskEdit = () => {
      setEditingRiskField(null);
      setRiskDraft("");
    };

    const saveRiskEdit = async () => {
      if (!editingRiskField || !activeSimulation) return;
      const trimmed = riskDraft.trim();

      let parsedValue: number | null = null;
      if (trimmed !== "") {
        const parsedNumber = Number(trimmed);
        if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
          toast.error("Enter a valid non-negative percentage.");
          return;
        }
        parsedValue = parsedNumber;
      }

      const currentValue = activeSimulation[editingRiskField] ?? null;
      if (currentValue === parsedValue) {
        cancelRiskEdit();
        return;
      }

      const payload: UpdateSimulatorSettingsRequest =
        editingRiskField === "max_position_pct"
          ? { max_position_pct: parsedValue }
          : { max_daily_loss_pct: parsedValue };

      const saved = await persistSimulatorSettings(payload, "Simulator setting updated");
      if (saved) {
        cancelRiskEdit();
      }
    };

    useEffect(() => {
      if (hasInitialSimulations) return;
      let isMounted = true;
      const loadSimulators = async () => {
        const token = await requireToken();
        if (!token) return;
        try {
          const simulators = await listSimulators(token);
          const mapped = await Promise.all(
            simulators.map(async (simulator) => {
              let stocks: Stock[] = [];
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
                last_run_at: simulator.last_run_at,
                next_run_at: simulator.next_run_at,
                max_position_pct: simulator.max_position_pct ?? null,
                max_daily_loss_pct: simulator.max_daily_loss_pct ?? null,
                stopped_reason: simulator.stopped_reason ?? null,
                stocks,
                trades: [],
              };

            }),
          );
          if (!isMounted) return;
          setSimulations(mapped);
          setActiveSimulation(mapped.length > 0 ? mapped[0] : null);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load simulators";
          toast.error(message);
        }
      };

      loadSimulators();
      return () => {
        isMounted = false;
      };
    }, [hasInitialSimulations]);

    const handleRunSimulator = async () => {
        if (!activeSimulationId || !activeSimulation) {
            toast.error("Create or load a simulator first.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            const result = await runSimulator(
                activeSimulationId,
                {
                  price_mode: activeSimulation.price_mode,
                  frequency: activeSimulation.frequency,
                },
                token,
            );
            const latestSummary = await getSimulatorSummary(activeSimulationId, token);
            setSummary(latestSummary);
            updateSimulationFromResponse(latestSummary.simulator);
            toast.success(`Run complete (${result.trades_executed} trades)`);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to run simulator";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

    const handleLoadSummary = async () => {
        if (!activeSimulationId) {
            toast.error("Create or load a simulator first.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            const data = await getSimulatorSummary(activeSimulationId, token);
            setSummary(data);
            toast.success("Summary loaded");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to load summary";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

    const handleDeleteSimulator = async (id: number) => {
        if (!Number.isFinite(id)) {
            toast.error("Invalid simulator id.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            await deleteSimulator(id, token);
            if (activeSimulationId === id) {
                setSummary(null);
            }
            toast.success("Simulator deleted");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to delete simulator";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

  const updateSimulationStocks = (simulationId: number, stocks: Stock[]) => {
    setSimulations((prev) =>
      prev.map((sim) => (sim.id === simulationId ? { ...sim, stocks } : sim)),
    );
  };

  const handleAddTrackedStock = async (stock: Stock) => {
    if (!activeSimulation) return;
    updateSimulationStocks(activeSimulation.id, [
      ...activeSimulation.stocks,
      stock,
    ]);
  };

  const handleRemoveTrackedStock = async (
    trackedId: number | null,
    symbol: string,
  ) => {
    const token = await requireToken();
    if (!token || !activeSimulation) return;

    if (!trackedId) {
      toast.error("No tracked stock id found for this item.");
      return;
    }

    setIsBusy(true);
    try {
      await deleteTrackedStock(Number(activeSimulation.id), trackedId, token);
      updateSimulationStocks(
        activeSimulation.id,
        activeSimulation.stocks.filter((stock) => stock.symbol !== symbol),
      );
      toast.success(`${symbol} removed from simulator watchlist`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove tracked stock";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddSimulation = async () => {
    if (simulations.length >= MAX_SIMULATIONS) {
      toast.error(`Max ${MAX_SIMULATIONS} simulations reached`);
      return;
    }
    const token = await requireToken();
    if (!token) return;

    setIsBusy(true);
    try {
      const simulator = await createSimulator(
        { name: "My Simulator", starting_cash: 10000 },
        token,
      );
      const newId = simulator.simulator_id;
      const newSimulation: Simulation = {
        id: newId,
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
        stocks: [],
        trades: [],
      };
      setSimulations((prev) => [...prev, newSimulation]);
      setActiveSimulation(newSimulation);
      toast.success("Simulator created");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create simulator";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRenameSimulation = async (id: number, name: string) => {
    const token = await requireToken();
    if (!token) return;
    
    try {
      const updated = await renameSimulator(id, name, token);
      setSimulations((prev) =>
      prev.map((sim) => (sim.id === id ? { ...sim, name } : sim)),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message: "Failed to rename simulator";
      toast.error(message);
    }
  };

  const handleCloseSimulation = async (id: number) => {
    await handleDeleteSimulator(id);
    const newSimulations = simulations.filter((sim) => sim.id !== id);
    setSimulations(newSimulations);
    if (newSimulations.length === 0) {
      setActiveSimulation(null);
      return;
    }
    if (activeSimulationId === id) {
      setActiveSimulation(newSimulations[0]);
    }
  }

  const renderSimulators = () => {
    if (simulations.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center bg-light/30 px-6 py-16">
            <div className="max-w-xl text-center space-y-4">
              <h2 className="text-2xl text-dark font-semibold">Create your first simulator</h2>
              <p className="text-gray">
                Start by setting up a simulator to track a watchlist and review trading
                activity.
              </p>
              <button
                disabled={isBusy}
                onClick={handleAddSimulation}
                className="inline-flex items-center justify-center rounded-md bg-blue px-5 py-2.5 text-white font-medium hover:bg-blue/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Create Simulator
              </button>
            </div>
          </div>
      )
    } else {
      return (
        <>
          {/* Tabs */}
          <SimulationTabs
            simulations={simulations}
            activeSimulationId={activeSimulationId}
            onSelectSimulation={(id) => {
              const next = simulations.find((sim) => sim.id === id) ?? null;
              setActiveSimulation(next);
            }}
            onCloseSimulation={handleCloseSimulation}
            onAddSimulation={handleAddSimulation}
            onRenameSimulation={handleRenameSimulation}
            isBusy={isBusy}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-light/30">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {activeSimulation && (
                <>
                  {/* Robot and Watchlist Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Robot */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-light p-4 shadow-sm">
                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                        <div className="xl:col-span-2 rounded-md border border-light bg-light/20 p-3">
                          <RobotTrader size={170} maxWidth={220} className="py-2" />
                          <div className="text-center">
                            <p className="text-dark font-medium">{activeSimulation.name}</p>
                            <p className="text-sm text-gray">
                              Status: {activeSimulation.status || "Active Trading"}
                            </p>
                          </div>
                        </div>

                        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="rounded-md bg-light/40 px-3 py-2">
                          <p className="text-gray text-xs">Starting Cash</p>
                          <p className="text-dark font-medium">
                            {formatCurrency(activeSimulation.starting_cash)}
                          </p>
                        </div>
                        <div className="rounded-md bg-light/40 px-3 py-2">
                          <p className="text-gray text-xs">Cash Balance</p>
                          <p className="text-dark font-medium">
                            {formatCurrency(activeSimulation.cash_balance)}
                          </p>
                        </div>

                        <div className="rounded-md bg-light/40 px-3 py-2">
                          <p className="text-gray text-xs mb-1">Frequency</p>
                          <Dropdown
                            className="w-full"
                            value={activeSimulation.frequency}
                            disabled={isBusy}
                            options={[
                              { label: "Daily", value: "daily" },
                              { label: "Twice a day", value: "twice_daily" },
                            ]}
                            onChange={(value) => {
                              void persistSimulatorSettings(
                                { frequency: value as Simulation["frequency"] },
                              );
                            }}
                          />
                        </div>

                        <div className="rounded-md bg-light/40 px-3 py-2">
                          <p className="text-gray text-xs mb-1">Price Mode</p>
                          <Dropdown
                            className="w-full"
                            value={activeSimulation.price_mode}
                            disabled={isBusy}
                            options={[
                              { label: "Close", value: "close" },
                              { label: "Open", value: "open" },
                            ]}
                            onChange={(value) => {
                              void persistSimulatorSettings(
                                { price_mode: value as Simulation["price_mode"] },
                              );
                            }}
                          />
                        </div>

                        <div
                          className="rounded-md bg-light/40 px-3 py-2"
                          onDoubleClick={() => beginRiskEdit("max_daily_loss_pct")}
                        >
                          <p className="text-gray text-xs">Max Daily Loss %</p>
                          {editingRiskField === "max_daily_loss_pct" ? (
                            <input
                              autoFocus
                              type="number"
                              min="0"
                              step="0.01"
                              value={riskDraft}
                              onChange={(e) => setRiskDraft(e.target.value)}
                              onBlur={saveRiskEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  void saveRiskEdit();
                                }
                                if (e.key === "Escape") {
                                  cancelRiskEdit();
                                }
                              }}
                              className="mt-1 w-full rounded border border-light px-2 py-1 text-sm"
                            />
                          ) : (
                            <>
                              <p className="text-dark font-medium">
                                {formatPercentage(activeSimulation.max_daily_loss_pct)}
                              </p>
                              <p className="text-[11px] text-gray">Double-click to edit</p>
                            </>
                          )}
                        </div>

                        <div
                          className="rounded-md bg-light/40 px-3 py-2"
                          onDoubleClick={() => beginRiskEdit("max_position_pct")}
                        >
                          <p className="text-gray text-xs">Max Position %</p>
                          {editingRiskField === "max_position_pct" ? (
                            <input
                              autoFocus
                              type="number"
                              min="0"
                              step="0.01"
                              value={riskDraft}
                              onChange={(e) => setRiskDraft(e.target.value)}
                              onBlur={saveRiskEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  void saveRiskEdit();
                                }
                                if (e.key === "Escape") {
                                  cancelRiskEdit();
                                }
                              }}
                              className="mt-1 w-full rounded border border-light px-2 py-1 text-sm"
                            />
                          ) : (
                            <>
                              <p className="text-dark font-medium">
                                {formatPercentage(activeSimulation.max_position_pct)}
                              </p>
                              <p className="text-[11px] text-gray">Double-click to edit</p>
                            </>
                          )}
                        </div>

                        <div className="rounded-md bg-light/40 px-3 py-2">
                          <p className="text-gray text-xs">Last Run At</p>
                          <p className="text-dark font-medium">
                            {formatDateTime(activeSimulation.last_run_at)}
                          </p>
                        </div>
                        <div className="rounded-md bg-light/40 px-3 py-2">
                          <p className="text-gray text-xs">Next Run At</p>
                          <p className="text-dark font-medium">
                            {formatDateTime(activeSimulation.next_run_at)}
                          </p>
                        </div>
                        </div>
                      </div>
                    </div>

                    {/* Watchlist */}
                    <div>
                      <TrackedStockSearch
                        simulatorId={activeSimulationId}
                        existingSymbols={
                          activeSimulation?.stocks.map((stock) => stock.symbol) ?? []
                        }
                        onAddStock={handleAddTrackedStock}
                      />
                      <StockWatchlist
                        stocks={activeSimulation.stocks}
                        onRemove={handleRemoveTrackedStock}
                      />
                    </div>
                  </div>

                  {/* Trading Activity Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-dark">Trading Activity</h2>
                      <div className="flex gap-2 bg-white rounded-lg p-1 border border-light shadow-sm">
                        <button
                          disabled={isBusy}
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                            viewMode === 'table'
                              ? 'bg-blue text-white'
                              : 'text-gray hover:text-dark hover:bg-light/50'
                          } ${isBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <GoTable className="size-4" />
                          Table
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => setViewMode('graph')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                            viewMode === 'graph'
                              ? 'bg-blue text-white'
                              : 'text-gray hover:text-dark hover:bg-light/50'
                          } ${isBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <FaChartBar className="size-4" />
                          Graph
                        </button>
                      </div>
                    </div>

                    {viewMode === 'table' ? (
                      <TradingActivityTable records={activeSimulation.trades} />
                    ) : (
                      <TradingActivityGraph records={activeSimulation.trades} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )
    }
  };

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)] min-h-screen">
            <Navbar search={false} />
            <Toaster position="top-center" />
            <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 xl:pt-10 text-dark">
                <div className="size-full flex flex-col bg-white">
                  {renderSimulators()}
                </div>
            </div>
        </div>
    );
}
