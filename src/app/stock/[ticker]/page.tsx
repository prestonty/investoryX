import { getStockPrice, getStockOverview, getStockHistory } from "@/lib/api";
import { Suspense } from "react";
import StockClient from "./StockClient";

export default async function Stock({
    params,
}: {
    params: Promise<{ ticker: string }>;
}) {
    const { ticker } = await params;
    const basicStockData = await getStockPrice(ticker);
    const advancedStockData = await getStockOverview(ticker);
    const initialChartData = await getStockHistory(ticker);

    return (
        <section>
            <Suspense fallback={<p>Loading feed...</p>}>
                <StockClient
                    ticker={ticker}
                    initialChartData={initialChartData}
                    basicStockData={basicStockData}
                    advancedStockData={advancedStockData}
                />
            </Suspense>
        </section>
    );
}
