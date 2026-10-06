import {
    getStockPrice,
    getStockOverview,
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
    const { ticker } = await params;
    const normalizedTicker = ticker.toUpperCase();

    let data;
    try {
        data = await Promise.all([
            getStockInfo(normalizedTicker).catch((e) => { console.error("[stock page] getStockInfo failed:", e?.message); throw e; }),
            getStockPrice(normalizedTicker).catch((e) => { console.error("[stock page] getStockPrice failed:", e?.message); throw e; }),
            getStockOverview(normalizedTicker).catch((e) => { console.error("[stock page] getStockOverview failed:", e?.message); throw e; }),
        ]);
    } catch {
        return <StockErrorClient />;
    }
    const [stockInfo, basicStockData, advancedStockData] = data;

    return (
        <section>
            <StockClient
                ticker={normalizedTicker}
                stock_id={stockInfo.stock_id}
                basicStockData={basicStockData}
                advancedStockData={advancedStockData}
            />
        </section>
    );
}

