// BFF

// Fetch stock history for candlestick charts
export async function getStockHistory(
    ticker: string,
    period: string = "1mo",
    interval: string = "1d"
) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch stock history");
    }

    return res.json();
}

// Fetch general stock information to populate stock page
export async function getStockPrice(ticker: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/stocks/${ticker}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch basic stock data");
    }

    return res.json();
}

export async function getStockOverview(ticker: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-overview/${ticker}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch advanced stock data");
    }

    return res.json();
}
