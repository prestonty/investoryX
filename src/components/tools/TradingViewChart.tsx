"use client";

import { useEffect, useId, useRef } from "react";

type TradingViewStudy =
    | string
    | { id: string; inputs?: Record<string, number | string> };

interface TradingViewWidgetOptions {
    symbol: string;
    interval: string;
    style: string;
    container_id: string;
    studies?: TradingViewStudy[];
    studies_overrides?: Record<string, number | string>;
    [key: string]: unknown;
}

declare global {
    interface Window {
        TradingView?: {
            widget: new (options: TradingViewWidgetOptions) => unknown;
        };
    }
}

const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";
let tvScriptPromise: Promise<void> | null = null;

// Load tv.js once and share it across every chart on the page
function loadTradingView(): Promise<void> {
    if (window.TradingView) return Promise.resolve();
    if (tvScriptPromise) return tvScriptPromise;

    tvScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = TV_SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            tvScriptPromise = null;
            script.remove();
            reject(new Error("Failed to load TradingView"));
        };
        document.head.appendChild(script);
    });
    return tvScriptPromise;
}

export type TimeframeKey = "M" | "W" | "D";

export interface TimeframePreset {
    key: TimeframeKey;
    label: string;
    interval: string;
    // TradingView chart style: "1" = candles, "8" = Heikin Ashi
    style: "1" | "8";
    studies: TradingViewStudy[];
    studiesOverrides: Record<string, number | string>;
    legend: { label: string; color?: string }[];
    badgeClass: string;
}

const MACD_LEGEND = { label: "MACD 12·26·9" };

export const TIMEFRAME_PRESETS: TimeframePreset[] = [
    {
        key: "M",
        label: "Monthly",
        interval: "M",
        style: "8",
        studies: ["MASimple@tv-basicstudies", "MACD@tv-basicstudies"],
        studiesOverrides: {
            "moving average.length": 10,
            "moving average.plot.color": "#d0003a",
            "moving average.plot.linewidth": 2,
            "MACD.fast length": 12,
            "MACD.slow length": 26,
            "MACD.signal smoothing": 9,
        },
        legend: [{ label: "SMA(10)", color: "#d0003a" }, MACD_LEGEND],
        badgeClass: "bg-red-50 text-red-700 border-red-200",
    },
    {
        key: "W",
        label: "Weekly",
        interval: "W",
        style: "8",
        studies: ["MAExp@tv-basicstudies", "MACD@tv-basicstudies"],
        studiesOverrides: {
            "moving average exponential.length": 20,
            "moving average exponential.plot.color": "#e07800",
            "moving average exponential.plot.linewidth": 2,
            "MACD.fast length": 12,
            "MACD.slow length": 26,
            "MACD.signal smoothing": 9,
        },
        legend: [{ label: "EMA(20)", color: "#e07800" }, MACD_LEGEND],
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
        key: "D",
        label: "Daily",
        interval: "D",
        style: "8",
        studies: [
            { id: "MAExp@tv-basicstudies", inputs: { length: 9 } },
            { id: "MAExp@tv-basicstudies", inputs: { length: 20 } },
            {
                id: "MACD@tv-basicstudies",
                inputs: {
                    "fast length": 12,
                    "slow length": 26,
                    "signal smoothing": 9,
                },
            },
        ],
        studiesOverrides: {
            "moving average exponential.0.plot.color": "#ff0000",
            "moving average exponential.0.plot.linewidth": 2,
            "moving average exponential.1.plot.color": "#00a651",
            "moving average exponential.1.plot.linewidth": 2,
        },
        legend: [
            { label: "EMA(9)", color: "#ff0000" },
            { label: "EMA(20)", color: "#00a651" },
            MACD_LEGEND,
        ],
        badgeClass: "bg-green-50 text-green-700 border-green-200",
    },
];

export default function TradingViewChart({
    symbol,
    preset,
    className = "",
}: {
    symbol: string;
    preset: TimeframePreset;
    className?: string;
}) {
    // TradingView looks the container up by id, and useId() includes colons
    const containerId = `tv-chart-${useId().replace(/:/g, "")}`;
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const container = containerRef.current;

        loadTradingView()
            .then(() => {
                if (cancelled || !container || !window.TradingView) return;
                container.innerHTML = "";
                new window.TradingView.widget({
                    symbol,
                    interval: preset.interval,
                    style: preset.style,
                    container_id: containerId,
                    theme: "light",
                    locale: "en",
                    toolbar_bg: "#f5f7fa",
                    backgroundColor: "rgba(255,255,255,1)",
                    gridColor: "rgba(208,216,228,0.5)",
                    autosize: true,
                    allow_symbol_change: false,
                    hide_top_toolbar: false,
                    hide_legend: false,
                    save_image: false,
                    withdateranges: true,
                    show_popup_button: true,
                    studies: preset.studies,
                    studies_overrides: preset.studiesOverrides,
                });
            })
            .catch((error) => {
                console.error("Error loading TradingView chart: ", error);
                if (!cancelled && container) {
                    container.textContent = "Chart unavailable.";
                }
            });

        return () => {
            cancelled = true;
            if (container) container.innerHTML = "";
        };
    }, [symbol, preset, containerId]);

    return (
        <div
            id={containerId}
            ref={containerRef}
            className={`w-full ${className}`}
        />
    );
}
