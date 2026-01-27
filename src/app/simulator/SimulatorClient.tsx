"use client";

import { useState } from "react";
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
            <div className="mx-auto max-w-4xl px-6 py-10 text-dark">
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
      <div className="flex-1 overflow-auto bg-[#E8EBED]/30">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {activeSimulation && (
            <>
              {/* Robot and Watchlist Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Robot */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-[#E8EBED] p-6 shadow-sm">
                  <RobotTrader />
                  <div className="text-center mt-4">
                    <p className="text-[#181D2A] font-medium">{activeSimulation.name}</p>
                    <p className="text-sm text-[#7E8391]">Status: Active Trading</p>
                  </div>
                </div>

                {/* Watchlist */}
                <div>
                  <StockWatchlist stocks={activeSimulation.stocks} />
                </div>
              </div>

              {/* Trading Activity Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#181D2A]">Trading Activity</h2>
                  <div className="flex gap-2 bg-white rounded-lg p-1 border border-[#E8EBED] shadow-sm">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        viewMode === 'table'
                          ? 'bg-[#748EFE] text-white'
                          : 'text-[#7E8391] hover:text-[#181D2A] hover:bg-[#E8EBED]/50'
                      }`}
                    >
                      <GoTable className="size-4" />
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('graph')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        viewMode === 'graph'
                          ? 'bg-[#748EFE] text-white'
                          : 'text-[#7E8391] hover:text-[#181D2A] hover:bg-[#E8EBED]/50'
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
