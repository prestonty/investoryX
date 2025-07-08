"use client";

import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";
import { dateConverter } from "@/utils/helper";
import type {
    PeriodType,
    IntervalType,
    Period,
    Interval,
} from "@/types/history";
import Navbar from "@/components/Navbar";
import CandlestickChart from "@/components/tools/Chart";

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

export default function Test() {
    const [chartData, setChartData] = useState<ChartProps>(null);
    const [ticker, setTicker] = useState("");
    const [period, setPeriod] = useState<PeriodType>("1mo");
    const [interval, setInterval] = useState<IntervalType>("1d");

    useEffect(() => {
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
    }, []);
    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)] mb-6">
            <div className="h-[6vh] flex flex-col justify-evenly mb-[2vh]">
                <Navbar />
            </div>

            <div className="">
                {chartData === null ? (
                    <div className="flex justify-center items-center h-[80vh]">
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
    );
}
