"use client";

import { useState, useEffect } from "react";
import { dateConverter } from "@/lib/utils/helper";
import Navbar from "@/components/Navbar";
import TradingViewChart, {
    TIMEFRAME_PRESETS,
    type TimeframeKey,
} from "@/components/tools/TradingViewChart";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

import { addToWatchlist } from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";
import { useGuest } from "@/contexts/GuestContext";
import { addGuestWatchlistItem } from "@/lib/guestStorage";

interface BasicStockData {
    companyName: string;
    tickerSymbol: string;
    stockPrice: string;
    priceChange: string;
    priceChangePercent: string;
}

interface AdvanceStockData {
    "Market Cap"?: string;
    "Revenue (ttm)"?: string;
    "Net Income (ttm)"?: string;
    "Shares Out"?: string;
    "ESP (ttm)"?: string;
    "PE Ratio"?: string;
    "Foward PE"?: string;
    Dividend?: string;
    "Ex-Dividend Date"?: string;
    Volume?: string;
    Open?: string;
    "Previous Close"?: string;
    "Day's Range"?: string;
    "52-Week Range"?: string;
    Beta?: string;
    Analysts?: string;
    "Price Target"?: string;
    "Earnings Date"?: string;
}

export default function StockClient({
    ticker,
    stock_id,
    basicStockData,
    advancedStockData,
}: {
    ticker: string;
    stock_id: number;
    basicStockData: BasicStockData;
    advancedStockData: AdvanceStockData;
}) {
    const { isGuest } = useGuest();
    const [chartView, setChartView] = useState<TimeframeKey | "ALL">("D");
    const [showInfo, setShowInfo] = useState(true);
    // With the info panel hidden, the chart card is wide enough to put "All" side by side
    const isWideGrid = chartView === "ALL" && !showInfo;
    const [isMounted, setIsMounted] = useState(false);

    const priceDirection = basicStockData.priceChange.includes("-")
        ? false
        : true;
    const priceChangeColor = priceDirection ? "text-green" : "text-red";
    const directionSymbol = priceDirection ? "+" : "";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Split advanced data into first 4 (single column) and the rest (grid)
    const advancedEntries = Object.entries(advancedStockData || {});

    const handleAddToWatchlist = async (stock_id: number) => {
        try {
            const token = await getTokenWithRefresh();
            if (!token) {
                if (isGuest) {
                    addGuestWatchlistItem({
                        local_id: crypto.randomUUID(),
                        ticker,
                        company_name: basicStockData.companyName,
                        stock_id,
                        added_at: new Date().toISOString(),
                    });
                    toast.success("Added to guest watchlist");
                } else {
                    toast.error("Please log in to add to watchlist.");
                }
                return;
            }
            await addToWatchlist(stock_id, token);
            toast.success("Added to Watchlist");
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error(msg);
        }
    };

    return (
        <div className='bg-light font-[family-name:var(--font-geist-sans)] h-screen flex flex-col'>
            <div className='flex flex-col justify-evenly mb-4'>
                <Navbar search={true} />
            </div>
            {/* Toast */}
            <Toaster
                position='top-center'
                reverseOrder={false}
                gutter={8}
                containerClassName='flex justify-center'
                containerStyle={{}}
                toastOptions={{
                    // Define default options
                    className: "",
                    duration: 5000,
                    removeDelay: 1000,
                    style: {
                        background: "#fff",
                        color: "#181D2A",
                        textAlign: "center",
                    },

                    // Default options for specific types
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: "green",
                            secondary: "white",
                        },
                    },
                    error: {
                        duration: 3000,
                        iconTheme: {
                            primary: "red",
                            secondary: "white",
                        },
                    },
                }}
            />

            <div className='mx-[6%] grid gap-10 flex-1 px-4 sm:px-8 lg:px-16 pt-4 pb-10 max-[1580px]:grid-cols-1 min-[1580px]:[grid-template-columns:minmax(600px,3fr)_minmax(200px,2fr)]'>
                {/* Top left */}
                <div className='bg-white rounded-[20px] shadow-dark-md min-[1580px]:col-start-1 min-[1580px]:col-end-2 min-[1580px]:row-start-1 min-[1580px]:row-end-4'>
                    <div className='flex flex-col justify-center h-full py-4 px-8'>
                        <h1 className='text-3xl text-dark font-medium'>
                            {basicStockData.companyName} ({ticker})
                        </h1>

                        <div className='flex text-dark items-end mt-2'>
                            <p className='text-md mr-2 font-medium'>USD</p>
                            <p className='text-3xl mr-10 font-semibold'>
                                {basicStockData.stockPrice}
                            </p>
                            <p
                                className={`${priceChangeColor} text-2xl font-medium`}
                            >
                                {directionSymbol + basicStockData.priceChange} (
                                {directionSymbol +
                                    basicStockData.priceChangePercent}
                                %)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top right */}
                <div className='bg-white rounded-[20px] shadow-dark-md border border-slate-100 p-4 min-[1580px]:col-start-2 min-[1580px]:col-end-3 min-[1580px]:row-start-1 min-[1580px]:row-end-3'>
                    <div className='grid grid-cols-2 gap-4 h-full items-center'>
                        <button
                            className='flex justify-center items-center gap-2 text-white bg-blue px-4 py-2.5 rounded-lg hover:bg-darkblue active:scale-95 transition-all duration-200 font-semibold text-sm'
                            onClick={() => handleAddToWatchlist(stock_id)}
                        >
                            <FaPlus className='text-xs' />
                            Watchlist
                        </button>

                        <div className='relative group'>
                            <button
                                disabled
                                className='w-full text-slate-400 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg font-medium text-sm disabled:cursor-not-allowed'
                            >
                                Sentiment
                            </button>
                            <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                Coming Soon
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom left */}
                <div
                    className={`bg-white rounded-[20px] shadow-dark-md min-[1580px]:col-start-1 min-[1580px]:row-start-4 min-[1580px]:row-end-13 min-[1580px]:[min-width:750px] ${
                        showInfo
                            ? "min-[1580px]:col-end-2"
                            : "min-[1580px]:col-end-3"
                    }`}
                >
                    <div className='flex flex-col h-full py-4 px-8'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                            <h2 className='text-dark text-2xl'>Chart</h2>
                            <div className='flex flex-wrap items-center gap-2'>
                                <div className='flex rounded-lg border border-slate-200 bg-slate-50 p-1'>
                                    {[
                                        ...TIMEFRAME_PRESETS.map((preset) => ({
                                            key: preset.key,
                                            label: preset.label,
                                        })),
                                        { key: "ALL" as const, label: "All" },
                                    ].map((option) => (
                                        <button
                                            key={option.key}
                                            onClick={() =>
                                                setChartView(option.key)
                                            }
                                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                                                chartView === option.key
                                                    ? "bg-blue text-white"
                                                    : "text-dark/70 hover:bg-white"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <hr className='bg-dark rounded-full border-none h-0.5 px-4 my-2' />

                        <div
                            className={`mt-2 ${
                                isWideGrid
                                    ? "grid grid-cols-1 lg:grid-cols-3 gap-4"
                                    : "flex flex-col gap-6"
                            }`}
                        >
                            {TIMEFRAME_PRESETS.filter(
                                (preset) =>
                                    chartView === "ALL" ||
                                    chartView === preset.key,
                            ).map((preset) => (
                                <div key={preset.key}>
                                    <div className='flex flex-wrap items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-dark/70'>
                                        <span
                                            className={`px-2 py-0.5 rounded border ${preset.badgeClass}`}
                                        >
                                            {preset.label}
                                        </span>
                                        <span>
                                            {preset.style === "8"
                                                ? "Heikin Ashi"
                                                : "Candlestick"}
                                        </span>
                                        {preset.legend.map((item) => (
                                            <span
                                                key={item.label}
                                                className='flex items-center gap-1'
                                            >
                                                ·
                                                {item.color && (
                                                    <span
                                                        className='inline-block w-2 h-2 rounded-full'
                                                        style={{
                                                            background:
                                                                item.color,
                                                        }}
                                                    />
                                                )}
                                                <span
                                                    style={{
                                                        color: item.color,
                                                    }}
                                                >
                                                    {item.label}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                    <TradingViewChart
                                        symbol={ticker}
                                        preset={preset}
                                        className={
                                            chartView === "ALL" && showInfo
                                                ? "h-[26rem]"
                                                : "h-[34rem]"
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                        <a
                            href='https://www.tradingview.com/accounts/signin/'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='self-end mt-4 text-xs text-dark/60 hover:text-blue'
                        >
                            Data may be delayed. Log in to TradingView for
                            real-time data
                        </a>
                    </div>
                </div>

                {/* Bottom right */}
                {/* Collapsed, it shrinks to a header bar beside the price card so the chart can span both columns */}
                <div
                    className={`bg-white rounded-[20px] shadow-dark-md min-[1580px]:col-start-2 min-[1580px]:col-end-3 min-[1580px]:row-start-3 ${
                        showInfo
                            ? "min-[1580px]:row-end-13"
                            : "min-[1580px]:row-end-4 self-start"
                    }`}
                >
                    <div className='flex flex-col h-full py-4 px-8'>
                        <div className='flex items-center justify-between gap-2'>
                            <h2 className='text-dark text-2xl'>
                                Additional Information
                            </h2>
                            <button
                                onClick={() => setShowInfo((prev) => !prev)}
                                className='px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-dark/70 hover:bg-slate-50 transition-all duration-200'
                            >
                                {showInfo ? "Hide" : "Show"}
                            </button>
                        </div>
                        {showInfo && (
                            <>
                                <hr className='bg-dark rounded-full border-none h-0.5 px-4 my-2' />
                                <div className='mt-2 overflow-auto'>
                                    <table className='w-full text-sm text-dark border-separate border-spacing-0'>
                                        <tbody>
                                            {advancedEntries.map(([key], i) => {
                                                const value =
                                                    key ===
                                                        "Ex-Dividend Date" ||
                                                    key === "Earnings Date"
                                                        ? isMounted
                                                            ? dateConverter(
                                                                  advancedStockData[
                                                                      key as keyof AdvanceStockData
                                                                  ],
                                                              )
                                                            : "N/A"
                                                        : (advancedStockData[
                                                              key as keyof AdvanceStockData
                                                          ] ?? "N/A");
                                                return (
                                                    <tr
                                                        key={key}
                                                        className={
                                                            i % 2 === 0
                                                                ? "bg-gray-50"
                                                                : "bg-white"
                                                        }
                                                    >
                                                        <td className='py-2 px-3 font-medium text-dark/70 whitespace-nowrap rounded-l-lg w-1/2'>
                                                            {key}
                                                        </td>
                                                        <td className='py-2 px-3 font-semibold text-dark rounded-r-lg w-1/2'>
                                                            {value}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
