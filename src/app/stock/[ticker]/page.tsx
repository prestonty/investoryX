import {
    getStockPrice,
    getStockOverview,
    getStockHistory,
    getStockInfo,
} from "@/lib/api";
import { Suspense } from "react";
import StockClient from "./StockClient";

export const dynamic = "force-dynamic";

export default async function Stock({
    params,
}: {
    params: Promise<{ ticker: string }>;
}) {
    try {
        const { ticker } = await params;

        // Fetch all stock data with individual error handling
        const [stockInfo, basicStockData, advancedStockData, initialChartData] =
            await Promise.allSettled([
                getStockInfo(ticker),
                getStockPrice(ticker),
                getStockOverview(ticker),
                getStockHistory(ticker),
            ]);

        // Check if any critical data failed to load
        if (stockInfo.status === "rejected") {
            throw new Error("Failed to load stock information");
        }

        const stock_id = stockInfo.value.stock_id;

        return (
            <section>
                <Suspense fallback={<p>Loading feed...</p>}>
                    <StockClient
                        ticker={ticker}
                        stock_id={stock_id}
                        initialChartData={
                            initialChartData.status === "fulfilled"
                                ? initialChartData.value
                                : null
                        }
                        basicStockData={
                            basicStockData.status === "fulfilled"
                                ? basicStockData.value
                                : null
                        }
                        advancedStockData={
                            advancedStockData.status === "fulfilled"
                                ? advancedStockData.value
                                : null
                        }
                    />
                </Suspense>
            </section>
        );
    } catch (error) {
        // Graceful fallback UI for any failures
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 font-[family-name:var(--font-geist-sans)]'>
                <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-dark'>
                    <div className='text-center'>
                        <h1 className='text-2xl font-bold mb-4'>
                            Stock Data Unavailable
                        </h1>
                        <p className='text-gray-600 mb-6'>
                            We&apos;re having trouble loading the stock
                            information right now. This could be due to:
                        </p>
                        <ul className='text-left text-sm text-gray-600 space-y-2 mb-6'>
                            <li>
                                • Market data service temporarily unavailable
                            </li>
                            <li>• Network connectivity issues</li>
                            <li>• Stock symbol not found</li>
                        </ul>
                        <div className='space-y-3'>
                            <button
                                onClick={() => window.location.reload()}
                                className='w-full px-4 py-2 bg-blue text-white font-semibold rounded hover:bg-blue-700 transition-colors'
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className='w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition-colors'
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
