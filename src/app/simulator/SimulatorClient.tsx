"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import {
    addTrackedStock,
    createSimulator,
    deleteSimulator,
    getStockPrice,
    getSimulatorSummary,
    listSimulators,
    runSimulator,
    type SimulatorSummaryResponse,
} from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";

import { SimulationTabs } from '@/components/simulator/SimulationTabs';
import { RobotTrader } from '@/components/simulator/RobotTrader';
import { StockWatchlist, Stock } from '@/components/simulator/StockWatchlist';
import { TrackedStockSearch } from '@/components/simulator/TrackedStockSearch';
import { TradingActivityTable, TradeRecord } from '@/components/simulator/TradingActivityTable';
import { TradingActivityGraph } from '@/components/simulator/TradingActivityGraph';
import { FaChartBar } from "react-icons/fa";
import { GoTable } from "react-icons/go";


interface Simulation {
  id: string;
  name: string;
  stocks: Stock[];
  trades: TradeRecord[];
}

const parseNumber = (value: string | number | undefined) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const MAX_SIMULATIONS = 3;

export default function SimulatorClient() {
    const [simulatorId, setSimulatorId] = useState<number | null>(null);
    const [summary, setSummary] = useState<SimulatorSummaryResponse | null>(null);
    const [isBusy, setIsBusy] = useState(false);

        // Figma Code
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [activeSimulationId, setActiveSimulationId] = useState<string>("");
    const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
    const activeSimulation = simulations.find((sim) => sim.id === activeSimulationId);


    const requireToken = async () => {
        const token = await getTokenWithRefresh();
        if (!token) {
            toast.error("You must be logged in.");
            return null;
        }
        return token;
    };

    useEffect(() => {
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
                    let name = trackedStock.ticker;
                    let price = 0;
                    let change = 0;
                    let changePercent = 0;
                    try {
                      const basic = await getStockPrice(trackedStock.ticker);
                      name = basic.companyName ?? name;
                      price = parseNumber(basic.stockPrice);
                      change = parseNumber(basic.priceChange);
                      changePercent = parseNumber(basic.priceChangePercent);
                    } catch (priceError) {
                      console.error("Price lookup failed:", priceError);
                    }
                    return {
                      symbol: trackedStock.ticker,
                      name,
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
                id: String(simulator.simulator_id),
                name: simulator.name,
                stocks,
                trades: [],
              };
            }),
          );
          if (!isMounted) return;
          setSimulations(mapped);
          if (mapped.length > 0) {
            setActiveSimulationId(mapped[0].id);
            setSimulatorId(simulators[0].simulator_id);
          } else {
            setActiveSimulationId("");
            setSimulatorId(null);
          }
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
    }, []);

    const handleAddTrackedStock = async () => {
        if (!simulatorId) {
            toast.error("Create or load a simulator first.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            await addTrackedStock(
                simulatorId,
                { ticker: "NVDA", target_allocation: 25 },
                token,
            );
            toast.success("Tracked stock added");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to add tracked stock";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

    const handleRunSimulator = async () => {
        if (!simulatorId) {
            toast.error("Create or load a simulator first.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            const result = await runSimulator(
                simulatorId,
                { price_mode: "close", frequency: "daily" },
                token,
            );
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
        if (!simulatorId) {
            toast.error("Create or load a simulator first.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            const data = await getSimulatorSummary(simulatorId, token);
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

    const handleDeleteSimulator = async (id: string) => {
        const parsedId = Number(id);
        if (!Number.isFinite(parsedId)) {
            toast.error("Invalid simulator id.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            await deleteSimulator(parsedId, token);
            if (simulatorId === parsedId) {
                setSimulatorId(null);
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

  const updateSimulationStocks = (simulationId: string, stocks: Stock[]) => {
    setSimulations((prev) =>
      prev.map((sim) => (sim.id === simulationId ? { ...sim, stocks } : sim)),
    );
  };

  const handleAddWatchlistStock = (stock: Stock) => {
    if (!activeSimulation) return;
    updateSimulationStocks(activeSimulation.id, [...activeSimulation.stocks, stock]);
  };

  const handleRemoveWatchlistStock = (symbol: string) => {
    if (!activeSimulation) return;
    updateSimulationStocks(
      activeSimulation.id,
      activeSimulation.stocks.filter((stock) => stock.symbol !== symbol),
    );
    toast.success(`${symbol} removed from simulator watchlist`);
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
      const newId = String(simulator.simulator_id);
      const newSimulation: Simulation = {
        id: newId,
        name: simulator.name,
        stocks: [],
        trades: [],
      };
      setSimulations((prev) => [...prev, newSimulation]);
      setActiveSimulationId(newId);
      setSimulatorId(simulator.simulator_id);
      toast.success("Simulator created");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create simulator";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCloseSimulation = async (id: string) => {
    await handleDeleteSimulator(id);
    const newSimulations = simulations.filter((sim) => sim.id !== id);
    setSimulations(newSimulations);
    if (newSimulations.length === 0) {
      setActiveSimulationId("");
      return;
    }
    if (activeSimulationId === id) {
      setActiveSimulationId(newSimulations[0].id);
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
                onClick={handleAddSimulation}
                className="inline-flex items-center justify-center rounded-md bg-blue px-5 py-2.5 text-white font-medium hover:bg-blue/90 transition-colors"
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
            onSelectSimulation={setActiveSimulationId}
            onCloseSimulation={handleCloseSimulation}
            onAddSimulation={handleAddSimulation}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-light/30">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {activeSimulation && (
                <>
                  {/* Robot and Watchlist Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Robot */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-light p-6 shadow-sm">
                      <RobotTrader />
                      <div className="text-center mt-4">
                        <p className="text-dark font-medium">{activeSimulation.name}</p>
                        <p className="text-sm text-gray">Status: Active Trading</p>
                      </div>
                    </div>

                    {/* Watchlist */}
                    <div>
                      <TrackedStockSearch
                        simulatorId={simulatorId}
                        existingSymbols={
                          activeSimulation?.stocks.map((stock) => stock.symbol) ?? []
                        }
                        onAddStock={handleAddWatchlistStock}
                      />
                      <StockWatchlist
                        stocks={activeSimulation.stocks}
                        onRemove={handleRemoveWatchlistStock}
                      />
                    </div>
                  </div>

                  {/* Trading Activity Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-dark">Trading Activity</h2>
                      <div className="flex gap-2 bg-white rounded-lg p-1 border border-light shadow-sm">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                            viewMode === 'table'
                              ? 'bg-blue text-white'
                              : 'text-gray hover:text-dark hover:bg-light/50'
                          }`}
                        >
                          <GoTable className="size-4" />
                          Table
                        </button>
                        <button
                          onClick={() => setViewMode('graph')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                            viewMode === 'graph'
                              ? 'bg-blue text-white'
                              : 'text-gray hover:text-dark hover:bg-light/50'
                          }`}
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
            <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 xl:pt-10 text-dark">
                <div className="size-full flex flex-col bg-white">
                  {renderSimulators()}
                </div>
            </div>
        </div>
    );
}
