"use client";

import { useEffect } from "react";
import React from "react";

import dynamic from "next/dynamic";
import type { PlotData } from "plotly.js";
import type { PlotParams } from "react-plotly.js";

const Plot = dynamic<PlotParams>(
    () => {
        return import("react-plotly.js");
    },
    { ssr: false }
);

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
    data?: OHLC[];
    title?: string;
}

export default function CandlestickChart(chartData: ChartProps) {
    const { data, title = "Stock Price" } = chartData;
    const trace: Partial<PlotData> = {
        x: data.map((item) => item.date),
        open: data.map((item) => item.open),
        high: data.map((item) => item.high),
        low: data.map((item) => item.low),
        close: data.map((item) => item.close),
        type: "candlestick",
        xaxis: "x",
        yaxis: "y",
        name: title,
        line: { color: "rgba(45, 94, 201, 0.8)" },
    };

    return (
        // Parent container must provide a height for full responsiveness
        <div className="w-full h-full">
            <Plot
                data={[trace]}
                title={title}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
                config={{ responsive: true }}
                layout={{
                    autosize: true,
                    title: {
                        text: title,
                        font: {
                            size: 16,
                            color: "#333",
                        },
                        xref: "paper",
                        x: 0.05,
                    },
                    dragmode: "zoom",
                    margin: {
                        r: 60,
                        t: 60,
                        b: 60,
                        l: 60,
                    },
                    showlegend: false,
                    xaxis: {
                        autorange: true,
                        type: "date",
                        tickformat: "%Y-%m-%d",
                    },
                    yaxis: {
                        autorange: true,
                        type: "linear",
                        domain: [0, 1],
                    },
                }}
            />
        </div>
    );
}
