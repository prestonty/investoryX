"use client";

import { useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import {
    addTrackedStock,
    createSimulator,
    deleteSimulator,
    getSimulatorSummary,
    listSimulators,
    runSimulator,
    type SimulatorSummaryResponse,
} from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";

import { SimulationTabs } from '@/components/simulator/SimulationTabs';
import { RobotTrader } from '@/components/simulator/RobotTrader';
import { StockWatchlist, Stock } from '@/components/simulator/StockWatchlist';
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

const STOCK_CATALOG: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 178.32, change: 2.45, changePercent: 1.39 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 412.87, change: -1.23, changePercent: -0.30 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.56, change: 3.21, changePercent: 2.30 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 15.67, changePercent: 1.82 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 238.45, change: -5.32, changePercent: -2.18 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 398.45, change: 1.23, changePercent: 0.31 },
  { symbol: "JPM", name: "JPMorgan Chase", price: 182.67, change: -0.89, changePercent: -0.49 },
  { symbol: "V", name: "Visa Inc.", price: 278.90, change: 2.15, changePercent: 0.78 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 171.44, change: 1.18, changePercent: 0.69 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 486.90, change: -3.22, changePercent: -0.66 },
];

// Mock data
const generateMockSimulations = (): Simulation[] => {
  return [
    {
      id: '1',
      name: 'Tech Growth Strategy',
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 178.32, change: 2.45, changePercent: 1.39 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.87, change: -1.23, changePercent: -0.30 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 3.21, changePercent: 2.30 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 15.67, changePercent: 1.82 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: -5.32, changePercent: -2.18 },
      ],
      trades: [
        {
          id: '1',
          symbol: 'AAPL',
          action: 'BUY',
          price: 176.50,
          volume: 150,
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: '2',
          symbol: 'NVDA',
          action: 'BUY',
          price: 868.90,
          volume: 50,
          timestamp: new Date(Date.now() - 5400000),
        },
        {
          id: '3',
          symbol: 'MSFT',
          action: 'HOLD',
          price: 413.20,
          volume: 100,
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '4',
          symbol: 'TSLA',
          action: 'SELL',
          price: 242.10,
          volume: 75,
          timestamp: new Date(Date.now() - 1800000),
        },
        {
          id: '5',
          symbol: 'GOOGL',
          action: 'BUY',
          price: 140.25,
          volume: 200,
          timestamp: new Date(Date.now() - 900000),
        },
        {
          id: '6',
          symbol: 'AAPL',
          action: 'BUY',
          price: 178.10,
          volume: 120,
          timestamp: new Date(Date.now() - 300000),
        },
      ],
    },
    {
      id: '2',
      name: 'Value Investing Bot',
      stocks: [
        { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 398.45, change: 1.23, changePercent: 0.31 },
        { symbol: 'JPM', name: 'JPMorgan Chase', price: 182.67, change: -0.89, changePercent: -0.49 },
        { symbol: 'V', name: 'Visa Inc.', price: 278.90, change: 2.15, changePercent: 0.78 },
      ],
      trades: [
        {
          id: '7',
          symbol: 'BRK.B',
          action: 'BUY',
          price: 396.20,
          volume: 80,
          timestamp: new Date(Date.now() - 6000000),
        },
        {
          id: '8',
          symbol: 'JPM',
          action: 'HOLD',
          price: 183.45,
          volume: 150,
          timestamp: new Date(Date.now() - 4000000),
        },
        {
          id: '9',
          symbol: 'V',
          action: 'BUY',
          price: 276.30,
          volume: 100,
          timestamp: new Date(Date.now() - 2000000),
        },
      ],
    },
  ];
};

export default function SimulatorClient() {
    const [simulatorId, setSimulatorId] = useState<number | null>(null);
    const [summary, setSummary] = useState<SimulatorSummaryResponse | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [watchlistQuery, setWatchlistQuery] = useState("");

    const requireToken = async () => {
        const token = await getTokenWithRefresh();
        if (!token) {
            toast.error("You must be logged in.");
            return null;
        }
        return token;
    };

    const handleCreateSimulator = async () => {
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            const simulator = await createSimulator(
                { name: "My Simulator", starting_cash: 10000 },
                token,
            );
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

    const handleListSimulators = async () => {
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            const simulators = await listSimulators(token);
            if (simulators.length === 0) {
                toast("No simulators found");
                return;
            }
            setSimulatorId(simulators[0].simulator_id);
            toast.success("Loaded simulators");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to list simulators";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

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

    const handleDeleteSimulator = async () => {
        if (!simulatorId) {
            toast.error("No simulator selected.");
            return;
        }
        const token = await requireToken();
        if (!token) return;

        setIsBusy(true);
        try {
            await deleteSimulator(simulatorId, token);
            setSimulatorId(null);
            setSummary(null);
            toast.success("Simulator deleted");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to delete simulator";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

    // Figma Code
    const [simulations, setSimulations] = useState<Simulation[]>(generateMockSimulations());
  const [activeSimulationId, setActiveSimulationId] = useState<string>(simulations[0].id);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const activeSimulation = simulations.find((sim) => sim.id === activeSimulationId);

  const updateSimulationStocks = (simulationId: string, stocks: Stock[]) => {
    setSimulations((prev) =>
      prev.map((sim) => (sim.id === simulationId ? { ...sim, stocks } : sim)),
    );
  };

  const handleAddWatchlistStock = (stock: Stock) => {
    if (!activeSimulation) return;
    const exists = activeSimulation.stocks.some((item) => item.symbol === stock.symbol);
    if (exists) {
      toast("Already in watchlist");
      return;
    }
    if (activeSimulation.stocks.length >= 5) {
      toast("Watchlist is full");
      return;
    }
    updateSimulationStocks(activeSimulation.id, [...activeSimulation.stocks, stock]);
    setWatchlistQuery("");
    toast.success(`${stock.symbol} added to watchlist`);
  };

  const handleRemoveWatchlistStock = (symbol: string) => {
    if (!activeSimulation) return;
    updateSimulationStocks(
      activeSimulation.id,
      activeSimulation.stocks.filter((stock) => stock.symbol !== symbol),
    );
    toast.success(`${symbol} removed from simulator watchlist`);
  };

  const handleWatchlistSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = watchlistQuery.trim().toUpperCase();
    if (!normalized) return;
    const match = STOCK_CATALOG.find((stock) => stock.symbol === normalized);
    if (!match) {
      toast("No matching stock found");
      return;
    }
    handleAddWatchlistStock(match);
  };

  const filteredCatalog = watchlistQuery.trim()
    ? STOCK_CATALOG.filter((stock) => {
        const query = watchlistQuery.trim().toLowerCase();
        return (
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
        );
      })
    : [];

  const handleAddSimulation = () => {
    const newId = String(simulations.length + 1);
    const newSimulation: Simulation = {
      id: newId,
      name: `Simulation ${newId}`,
      stocks: [],
      trades: [],
    };
    setSimulations([...simulations, newSimulation]);
    setActiveSimulationId(newId);
  };

  const handleCloseSimulation = (id: string) => {
    if (simulations.length === 1) return; // Don't close the last simulation
    
    const newSimulations = simulations.filter((sim) => sim.id !== id);
    setSimulations(newSimulations);
    
    if (activeSimulationId === id) {
      setActiveSimulationId(newSimulations[0].id);
    }
  };

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)] min-h-screen">
            <Navbar search={false} />
            <Toaster position="top-center" />
            <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 xl:pt-10 text-dark">
                <div className="size-full flex flex-col bg-white">
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
                  <div className="bg-white rounded-lg border border-light p-4 shadow-sm mb-4">
                    <form onSubmit={handleWatchlistSubmit} className="flex gap-2">
                      <input
                        value={watchlistQuery}
                        onChange={(event) => setWatchlistQuery(event.target.value)}
                        placeholder="Search"
                        className="flex-1 rounded-md border border-light px-3 py-2 text-sm text-dark placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-blue/40"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-[#6A84F5] transition-colors"
                      >
                        Add
                      </button>
                    </form>
                    {filteredCatalog.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {filteredCatalog.slice(0, 5).map((stock) => (
                          <button
                            key={stock.symbol}
                            type="button"
                            onClick={() => handleAddWatchlistStock(stock)}
                            className="w-full rounded-md border border-light px-3 py-2 text-left text-sm hover:bg-light/50 transition-colors"
                          >
                            <span className="font-medium text-dark">{stock.symbol}</span>
                            <span className="text-gray"> - {stock.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
    </div>
            </div>
        </div>
    );
}
