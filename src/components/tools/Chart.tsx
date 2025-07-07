"use client";

import { useEffect } from "react";
import Plot from "react-plotly.js";

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
  var trace = {
    x: data.map((item) => item.date),
    open: data.map((item) => item.open),
    high: data.map((item) => item.high),
    low: data.map((item) => item.low),
    close: data.map((item) => item.close),
    type: "candlestick",
    xaxis: "x", // change
    yaxis: "y", // change
    name: title,

    // Customization styling
    line: { color: "rgba(45, 94, 201, 0.8)" },
  };

  useEffect(() => {
    console.log("Chart Data length: ", data.length);
    console.log("Chart Title: ", title);

    console.log(
      "X:",
      data.map((d) => d.date)
    );
    console.log(
      "Open:",
      data.map((d) => d.open)
    );
  }, []);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      {/* <h1>hello</h1> */}

      <Plot
        data={[trace]}
        layout={{
          title: "Candlestick Chart",
          dragmode: "zoom",
          showlegend: false,
          xaxis: { rangeslider: { visible: false } },
          yaxis: { autorange: true },
        }}
        config={{ responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
