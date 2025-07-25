// import dynamic from "next/dynamic";
// import axios from "axios";
// import StockClient from "./page";

// export default async function StockPage({
//     params,
// }: {
//     params: { ticker: string };
// }) {
//     const ticker = params.ticker.toUpperCase();
//     const period = "1mo";
//     const interval = "1d";

//     // loading page doesnt get triggered unless we use fetch. Do not use axios here
//     const result = await fetch(
//         `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`,
//         { cache: "no-store" } // optional: disable caching for fresh data
//     );

//     if (!result.ok) {
//         throw new Error("Failed to fetch stock data");
//     }

//     const chartData = await result.json();

//     return <StockClient initialChartData={chartData} ticker={ticker} />;
// }
