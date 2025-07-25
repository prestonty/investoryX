import { Suspense } from "react";
import StockClient from "./StockClient";

export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StockClient ticker={params.ticker} />
        </Suspense>
    );
}
