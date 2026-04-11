"use client";

import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import { dateConverter } from "@/lib/utils/helper";
import type { PeriodType, IntervalType } from "@/types/history";
import { PeriodOptions, IntervalOptions } from "@/types/history";
import Navbar from "@/components/Navbar";
import CandlestickChart from "@/components/tools/Chart";
import Autocomplete from "@/components/Autocomplete";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

import { addToWatchlist, getStockHistory } from "@/lib/api";
import { getTokenWithRefresh } from "@/lib/auth";

type OHLC = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    dividends: number;
};

interface ChartProps {
    data: OHLC[];
    title?: string;
}

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
    initialChartData,
    basicStockData,
    advancedStockData,
}: {
    ticker: string;
    stock_id: number;
    initialChartData: ChartProps | null;
    basicStockData: BasicStockData;
    advancedStockData: AdvanceStockData;
}) {
    const [chartData, setChartData] = useState<ChartProps | null>(
        initialChartData,
    );
    const [period, setPeriod] = useState<PeriodType>("1mo");
    const [interval, setInterval] = useState<IntervalType>("1d");
    const [isMounted, setIsMounted] = useState(false);
    const [isChartLoading, setIsChartLoading] = useState(false);

    const priceDirection = basicStockData.priceChange.includes("-")
        ? false
        : true;
    const priceChangeColor = priceDirection ? "text-green" : "text-red";
    const directionSymbol = priceDirection ? "+" : "";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Only fetch if period/interval changes from initial values
        if (period === "1mo" && interval === "1d") return; // Already have initial data
        const fetchData = async () => {
            try {
                setIsChartLoading(true);
                const result = await getStockHistory(ticker, period, interval);
                if (result && Array.isArray(result.data)) {
                    if (result.data.length === 0) {
                        toast.error("No chart data for period/interval");
                    }
                    setChartData(result);
                } else {
                    setChartData({
                        data: [],
                        title: "Stock Price",
                    });
                    toast.error("No chart data for period/interval");
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Chart data not available for this period/interval.";
                toast.error(message);
                console.error("Error fetching stock data: ", error);
            } finally {
                setIsChartLoading(false);
            }
        };
        fetchData();
    }, [period, interval, ticker]);

    // Split advanced data into first 4 (single column) and the rest (grid)
    const advancedEntries = Object.entries(advancedStockData || {});
    const selectedPeriodOption =
        PeriodOptions.find((option) => option.value === period) ?? null;
    const selectedIntervalOption =
        IntervalOptions.find((option) => option.value === interval) ?? null;

    const handleAddToWatchlist = async (stock_id: number) => {
        try {
            const token = await getTokenWithRefresh();
            if (!token) {
                alert("You must be logged in to add to watchlist.");
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
                <div className='bg-white rounded-[30px] shadow-dark-md min-[1580px]:col-start-1 min-[1580px]:col-end-2 min-[1580px]:row-start-1 min-[1580px]:row-end-4'>
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
                <div className='bg-white rounded-[30px] shadow-dark-md min-[1580px]:col-start-1 min-[1580px]:col-end-2 min-[1580px]:row-start-4 min-[1580px]:row-end-13 min-[1580px]:[min-width:750px]'>
                    <div className='flex flex-col h-full py-4 px-8'>
                        <h2 className='text-dark text-2xl'>Chart</h2>
                        <hr className='bg-dark rounded-full border-none h-0.5 px-4 my-2' />
                        <div className='w-fit grid grid-cols-2 grid-rows-2 gap-x-4 m-4'>
                            <p className='text-sm p-0 m-0 text-dark'>Period:</p>
                            <p className='text-sm p-0 m-0 text-dark'>
                                Interval:
                            </p>
                            <Autocomplete
                                options={PeriodOptions}
                                value={selectedPeriodOption}
                                onChange={(selectedOption) => {
                                    if (!selectedOption?.value) return;
                                    setPeriod(selectedOption.value);
                                }}
                            />
                            <Autocomplete
                                options={IntervalOptions}
                                value={selectedIntervalOption}
                                onChange={(selectedOption) => {
                                    if (!selectedOption?.value) return;
                                    setInterval(selectedOption.value);
                                }}
                            />
                        </div>

                        <div className='mt-4'>
                            {isChartLoading ? (
                                <div className='flex justify-center items-center h-[20rem]'>
                                    <FourSquare
                                        color='#181D2A'
                                        size='medium'
                                        text=''
                                        textColor=''
                                    />
                                </div>
                            ) : chartData ? (
                                <CandlestickChart
                                    data={chartData.data}
                                    title={chartData.title}
                                />
                            ) : (
                                <div className='flex justify-center items-center h-[20rem] text-dark'>
                                    No chart data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom right */}
                <div className='bg-white rounded-[30px] shadow-dark-md min-[1580px]:col-start-2 min-[1580px]:col-end-3 min-[1580px]:row-start-3 min-[1580px]:row-end-13'>
                    <div className='flex flex-col h-full py-4 px-8'>
                        <h2 className='text-dark text-2xl'>
                            Additional Information
                        </h2>
                        <hr className='bg-dark rounded-full border-none h-0.5 px-4 my-2' />
                        <div className='mt-2 overflow-auto'>
                            <table className='w-full text-sm text-dark border-separate border-spacing-0'>
                                <tbody>
                                    {advancedEntries.map(([key], i) => {
                                        const value =
                                            key === "Ex-Dividend Date" ||
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
                    </div>
                </div>
            </div>
        </div>
    );
}
