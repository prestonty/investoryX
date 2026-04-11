"use client";

import { useState, useEffect, useRef } from "react";
import {
    launchBacktest,
    getBacktestStatus,
    type BacktestResult,
} from "@/lib/api";
import { HiInformationCircle } from "react-icons/hi";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 60; // 2 minutes

interface TradingSandboxSectionProps {
    simulatorId: number;
    priceMode: "open" | "close";
    isBusy: boolean;
    getToken: () => Promise<string | null>;
    onBacktestComplete: (result: BacktestResult) => void;
}

function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function nearestWeekdayBefore(d: Date): Date {
    const copy = new Date(d);
    while (copy.getDay() === 0 || copy.getDay() === 6) {
        copy.setDate(copy.getDate() - 1);
    }
    return copy;
}

function getDefaultDates(): { start: string; end: string } {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const end = nearestWeekdayBefore(yesterday);

    const start = new Date(end);
    start.setDate(start.getDate() - 90);
    while (start.getDay() === 0 || start.getDay() === 6) {
        start.setDate(start.getDate() - 1);
    }

    return { start: toISODate(start), end: toISODate(end) };
}

export function TradingSandboxSection({
    simulatorId,
    priceMode,
    isBusy,
    getToken,
    onBacktestComplete,
}: TradingSandboxSectionProps) {
    const defaults = getDefaultDates();
    const [startDate, setStartDate] = useState(defaults.start);
    const [endDate, setEndDate] = useState(defaults.end);
    const [isRunning, setIsRunning] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<BacktestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const pollCountRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Max date = yesterday
    const yesterday = toISODate(nearestWeekdayBefore(new Date(Date.now() - 86400000)));

    const dateError =
        startDate && endDate && startDate >= endDate
            ? "Start date must be before end date"
            : endDate >= toISODate(new Date())
              ? "End date must be before today"
              : null;

    const canRun =
        !isRunning &&
        !isBusy &&
        !!startDate &&
        !!endDate &&
        !dateError &&
        !!simulatorId;

    // Poll for task status
    useEffect(() => {
        if (!taskId) return;

        pollCountRef.current = 0;
        intervalRef.current = setInterval(async () => {
            pollCountRef.current += 1;
            if (pollCountRef.current > MAX_POLLS) {
                clearInterval(intervalRef.current!);
                setIsRunning(false);
                setTaskId(null);
                setError("Backtest timed out — please try again.");
                return;
            }

            try {
                const token = await getToken();
                if (!token) return;
                const status = await getBacktestStatus(simulatorId, taskId, token);
                if (status.status === "success") {
                    clearInterval(intervalRef.current!);
                    setIsRunning(false);
                    setTaskId(null);
                    if (status.result) {
                        setLastResult(status.result);
                        onBacktestComplete(status.result);
                    }
                } else if (status.status === "failure") {
                    clearInterval(intervalRef.current!);
                    setIsRunning(false);
                    setTaskId(null);
                    setError(status.error || "Backtest failed");
                }
            } catch {
                // transient poll error — keep trying
            }
        }, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [taskId]);

    async function handleRunBacktest() {
        setError(null);
        setLastResult(null);

        const token = await getToken();
        if (!token) {
            setError("Authentication error — please log in again.");
            return;
        }

        try {
            setIsRunning(true);
            const response = await launchBacktest(
                simulatorId,
                {
                    start_date: startDate,
                    end_date: endDate,
                    price_mode: priceMode,
                    clear_previous: true,
                },
                token,
            );
            setTaskId(response.task_id);
        } catch (err: unknown) {
            setIsRunning(false);
            setError(err instanceof Error ? err.message : "Failed to launch backtest");
        }
    }

    const pnlColor =
        lastResult && Number(lastResult.pnl) >= 0
            ? "text-green-600"
            : "text-red-500";

    return (
        <div className='bg-white rounded-lg border border-light shadow-sm p-4 mb-6'>
            {/* Header */}
            <div className='flex items-center gap-2 mb-4'>
                <h2 className='text-dark'>Trading Sandbox</h2>
                <span className='text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full'>
                    BETA
                </span>
                <div className='group relative ml-1 inline-flex items-center'>
                <HiInformationCircle className='text-gray-400 text-base cursor-help select-none' />

                <div className='hidden group-hover:block absolute left-0 top-6 z-20 
                                w-64 px-3 py-2 bg-slate-900 text-white text-xs 
                                rounded-md shadow-lg pointer-events-none'>
                    Simulate your strategy on historical data. Note: New runs replace previous backtest results.
                </div>
                </div>
            </div>

            {/* Date pickers */}
            <div className='flex flex-wrap items-end gap-3 mb-4'>
                <div className='flex flex-col gap-1'>
                    <label className='text-xs text-gray'>From</label>
                    <input
                        type='date'
                        value={startDate}
                        max={yesterday}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isRunning}
                        className='border border-light rounded-md px-3 py-2 text-sm text-dark focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50'
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label className='text-xs text-gray'>To</label>
                    <input
                        type='date'
                        value={endDate}
                        max={yesterday}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isRunning}
                        className='border border-light rounded-md px-3 py-2 text-sm text-dark focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50'
                    />
                </div>
                <button
                    onClick={handleRunBacktest}
                    disabled={!canRun}
                    className='px-4 py-2 rounded-md bg-dark text-white text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'
                >
                    {isRunning && (
                        <span className='inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    )}
                    {isRunning ? "Running…" : "Run Backtest"}
                </button>
            </div>

            {/* Inline date validation */}
            {dateError && (
                <p className='text-red-500 text-xs mb-3'>{dateError}</p>
            )}

            {/* Progress */}
            {isRunning && (
                <div className='mb-4'>
                    <div className='flex items-center gap-2 text-sm text-gray mb-1'>
                        <span className='inline-block w-3 h-3 border-2 border-gray border-t-transparent rounded-full animate-spin' />
                        Running backtest across historical trading days…
                    </div>
                    <div className='w-full bg-light rounded-full h-1.5 overflow-hidden'>
                        <div className='h-full bg-dark animate-pulse rounded-full w-3/4' />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className='bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-600 mb-3'>
                    {error}
                </div>
            )}

            {/* Results */}
            {lastResult && !isRunning && (
                <div className='border border-light rounded-md p-3 bg-light/20'>
                    <p className='text-xs text-gray mb-2 font-medium uppercase tracking-wide'>
                        Backtest Results
                    </p>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                        <div>
                            <p className='text-xs text-gray'>Period</p>
                            <p className='text-sm text-dark font-medium'>
                                {lastResult.start_date} → {lastResult.end_date}
                            </p>
                        </div>
                        <div>
                            <p className='text-xs text-gray'>Trading Days</p>
                            <p className='text-sm text-dark font-medium'>
                                {lastResult.trading_days_run}
                            </p>
                        </div>
                        <div>
                            <p className='text-xs text-gray'>Total Trades</p>
                            <p className='text-sm text-dark font-medium'>
                                {lastResult.total_trades}
                            </p>
                        </div>
                        <div>
                            <p className='text-xs text-gray'>Starting Cash</p>
                            <p className='text-sm text-dark font-medium'>
                                ${Number(lastResult.starting_cash).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className='text-xs text-gray'>Final Cash</p>
                            <p className='text-sm text-dark font-medium'>
                                ${Number(lastResult.final_cash).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className='text-xs text-gray'>P&amp;L</p>
                            <p className={`text-sm font-medium ${pnlColor}`}>
                                {Number(lastResult.pnl) >= 0 ? "+" : ""}
                                ${Number(lastResult.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {" "}
                                ({Number(lastResult.pnl_pct) >= 0 ? "+" : ""}{Number(lastResult.pnl_pct).toFixed(2)}%)
                            </p>
                        </div>
                    </div>

                    {lastResult.warnings.length > 0 && (
                        <div className='mt-3 bg-amber-50 border border-amber-200 rounded-md px-3 py-2'>
                            <p className='text-xs font-medium text-amber-700 mb-1'>Warnings</p>
                            <ul className='text-xs text-amber-600 list-disc list-inside space-y-0.5'>
                                {lastResult.warnings.map((w, i) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
