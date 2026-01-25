import {
    getStockPrice,
    getStockOverview,
    getStockHistory,
    getStockInfo,
} from "@/lib/api";
import StockClient from "./StockClient";
import StockErrorClient from "./StockErrorClient";

export const dynamic = "force-dynamic";

export default async function Stock({
    params,
}: {
    params: Promise<{ ticker: string }>;
}) {
    try {
        const { ticker } = await params;
        const normalizedTicker = ticker.toUpperCase();

        const [stockInfo, basicStockData, advancedStockData, initialChartData] =
            await Promise.all([
                getStockInfo(normalizedTicker),
                getStockPrice(normalizedTicker),
                getStockOverview(normalizedTicker),
                getStockHistory(normalizedTicker),
            ]);

        return (
            <section>
                <StockClient
                    ticker={normalizedTicker}
                    stock_id={stockInfo.stock_id}
                    initialChartData={initialChartData}
                    basicStockData={basicStockData}
                    advancedStockData={advancedStockData}
                />
            </section>
        );
    } catch (error) {
        return <StockErrorClient />;
    }
}

