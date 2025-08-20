"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";
import { dateConverter } from "@/lib/utils/helper";
import type { PeriodType, IntervalType } from "@/types/history";
import { PeriodOptions, IntervalOptions } from "@/types/history";
import Navbar from "@/components/Navbar";
import CandlestickChart from "@/components/tools/Chart";
import Autocomplete from "@/components/Autocomplete";
import Button from "@/components/Button";

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
    initialChartData,
    basicStockData,
    advancedStockData,
}: {
    ticker: string;
    initialChartData: ChartProps;
    basicStockData: BasicStockData;
    advancedStockData: AdvanceStockData;
}) {
    const [chartData, setChartData] = useState<ChartProps>(initialChartData);
    const [period, setPeriod] = useState<PeriodType>("1mo");
    const [interval, setInterval] = useState<IntervalType>("1d");

    const priceDirection = basicStockData.priceChange.includes("-")
        ? false
        : true;
    const priceChangeColor = priceDirection ? "text-green" : "text-red";
    const directionSymbol = priceDirection ? "+" : "";

    useEffect(() => {
        // Only fetch if period/interval changes from initial values
        if (period === "1mo" && interval === "1d") return; // Already have initial data
        const fetchData = async () => {
            try {
                const result = await axios(
                    `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`,
                );
                setChartData(result.data);
            } catch (error) {
                console.error("Error fetching stock data: ", error);
            }
        };
        fetchData();
    }, [period, interval, ticker]);

    // Split advanced data into first 4 (single column) and the rest (grid)
    const advancedEntries = Object.entries(advancedStockData || {});
    const firstFourAdvanced = advancedEntries.slice(0, 4);
    const remainingAdvanced = advancedEntries.slice(4);

    // useEffect(() => {
    //     console.log(advancedStockData);
    //     console.log(advancedStockData["Market Cap"]);
    // }, [advancedStockData]);

    return (
        <div className='bg-light font-[family-name:var(--font-geist-sans)] h-screen flex flex-col'>
            <div className='flex flex-col justify-evenly mb-4'>
                <Navbar search={true} />
            </div>

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
                <div className='bg-white rounded-[30px] shadow-dark-md min-[1580px]:col-start-2 min-[1580px]:col-end-3 min-[1580px]:row-start-1 min-[1580px]:row-end-3'>
                    <div className='flex flex-col sm:flex-row justify-evenly items-center gap-y-4 h-full py-4 px-2 text-md md:text-xl xl:text-lg'>
                        <button className='text-nowrap text-white bg-dark px-4 py-4 rounded-full w-fit h-fit flex justify-center items-center hover:bg-light hover:text-dark transition-all duration-500'>
                            Add to Watchlist
                        </button>
                        <div className='relative group w-fit h-fit'>
                            <button
                                disabled
                                className='text-nowrap text-white bg-dark px-4 py-4 rounded-full w-fit h-fit flex justify-center items-center transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Sentimental Analysis
                            </button>

                            {/* Tooltip */}
                            <span className='absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dark text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                Coming soon
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
                                onChange={(selectedOption) =>
                                    setPeriod(selectedOption?.value)
                                }
                            />
                            <Autocomplete
                                options={IntervalOptions}
                                onChange={(selectedOption) =>
                                    setInterval(selectedOption?.value)
                                }
                            />
                        </div>

                        <div className='mt-4'>
                            {chartData === null ? (
                                <div className='flex justify-center items-center h-[20rem]'>
                                    <FourSquare
                                        color='#181D2A'
                                        size='medium'
                                        text=''
                                        textColor=''
                                    />
                                </div>
                            ) : (
                                <CandlestickChart
                                    data={chartData.data}
                                    title={chartData.title}
                                />
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
                        {/* First 4 items in a single column */}
                        <div className='mt-4 flex flex-col gap-y-3'>
                            {firstFourAdvanced.map(([key]) => (
                                <div
                                    key={key}
                                    className='flex gap-x-2 items-center'
                                >
                                    <p className='text-md text-dark'>{key}:</p>
                                    <p className='text-md text-dark'>
                                        {advancedStockData[
                                            key as keyof AdvanceStockData
                                        ] ?? "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Remaining items follow a responsive grid */}
                        {remainingAdvanced.length > 0 && (
                            <div className='mt-6 grid grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-4'>
                                {remainingAdvanced.map(([key]) => (
                                    <div
                                        key={key}
                                        className='flex gap-x-2 items-center'
                                    >
                                        <p className='text-md text-dark'>
                                            {key}:
                                        </p>
                                        {key === "Ex-Dividend Date" ||
                                        key === "Earnings Date" ? (
                                            <p className='text-md text-dark'>
                                                {dateConverter(
                                                    advancedStockData[
                                                        key as keyof AdvanceStockData
                                                    ],
                                                ) ?? "N/A"}
                                            </p>
                                        ) : (
                                            <p className='text-md text-dark'>
                                                {advancedStockData[
                                                    key as keyof AdvanceStockData
                                                ] ?? "N/A"}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
