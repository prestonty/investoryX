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
                getStockInfo(normalizedTicker).catch((e) => { console.error("[stock page] getStockInfo failed:", e?.message); throw e; }),
                getStockPrice(normalizedTicker).catch((e) => { console.error("[stock page] getStockPrice failed:", e?.message); throw e; }),
                getStockOverview(normalizedTicker).catch((e) => { console.error("[stock page] getStockOverview failed:", e?.message); throw e; }),
                getStockHistory(normalizedTicker).catch((e) => { console.error("[stock page] getStockHistory failed:", e?.message); throw e; }),
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

