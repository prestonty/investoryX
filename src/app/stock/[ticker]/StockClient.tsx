"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";
import { dateConverter } from "@/utils/helper";
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
                    `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`
                );
                setChartData(result.data);
            } catch (error) {
                console.error("Error fetching stock data: ", error);
            }
        };
        fetchData();
    }, [period, interval, ticker]);

    // useEffect(() => {
    //     console.log(advancedStockData);
    //     console.log(advancedStockData["Market Cap"]);
    // }, [advancedStockData]);

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)] h-screen flex flex-col">
            <div className="flex flex-col justify-evenly mb-4">
                <Navbar search={true} />
            </div>

            <div
                className="grid grid-rows-12 gap-10 flex-1 px-16 pt-4 pb-10"
                style={{
                    minWidth: "1200px",
                    gridTemplateColumns:
                        "minmax(600px, 3fr) minmax(200px, 2fr)",
                }}
            >
                {/* Top left */}
                <div className="col-start-1 col-end-2 row-start-1 row-end-4 bg-white rounded-[30px] shadow-dark-md">
                    <div className="flex flex-col justify-center h-full py-4 px-8">
                        <h1 className="text-3xl text-dark font-medium">
                            {basicStockData.companyName} ({ticker})
                        </h1>

                        <div className="flex text-dark items-end mt-2">
                            <p className="text-md mr-2 font-medium">USD</p>
                            <p className="text-3xl mr-10 font-semibold">
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
                <div className="col-start-2 col-end-3 row-start-1 row-end-3 bg-white rounded-[30px] shadow-dark-md">
                    <div className="flex justify-evenly items-center h-full py-4 px-8">
                        <button className="text-white text-2xl bg-dark px-6 py-4 rounded-full w-fit h-fit flex justify-center items-center hover:bg-light hover:text-dark transition-all duration-500">
                            Add to Watchlist
                        </button>
                        <button className="text-white text-2xl bg-dark px-6 py-4 rounded-full w-fit h-fit flex justify-center items-center hover:bg-light hover:text-dark transition-all duration-500">
                            Sentimental Analysis
                        </button>
                    </div>
                </div>

                {/* Bottom left */}
                <div
                    className="col-start-1 col-end-2 row-start-4 row-end-13 bg-white rounded-[30px] shadow-dark-md"
                    style={{ minWidth: "750px" }}
                >
                    <div className="flex flex-col h-full py-4 px-8">
                        <h2 className="text-dark text-2xl">Chart</h2>
                        <hr className="bg-dark rounded-full border-none h-0.5 px-4 my-2" />
                        <div className="grid grid-cols-2 grid-rows-2 gap-x-4 m-10">
                            <p className="text-lg text-dark">Period:</p>
                            <p className="text-lg text-dark">Interval:</p>
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

                        <div className="mt-4">
                            {chartData === null ? (
                                <div className="flex justify-center items-center h-[20rem]">
                                    <FourSquare
                                        color="#181D2A"
                                        size="medium"
                                        text=""
                                        textColor=""
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
                <div className="col-start-2 col-end-3 row-start-3 row-end-13 bg-white rounded-[30px] shadow-dark-md">
                    <div className="flex flex-col h-full py-4 px-8">
                        <h2 className="text-dark text-2xl">
                            Additional Information
                        </h2>
                        <hr className="bg-dark rounded-full border-none h-0.5 px-4 my-2" />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-4">
                            {Object.entries(advancedStockData).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex gap-x-2 items-center"
                                    >
                                        <p className="text-md text-dark">
                                            {key}:
                                        </p>
                                        <p className="text-md text-dark">
                                            {advancedStockData[
                                                key as keyof AdvanceStockData
                                            ] ?? "N/A"}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
