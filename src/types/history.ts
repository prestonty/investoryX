// History is used for the interval and period parameters for candle stick charts

export const Interval = {
    "1 Minute": "1m",
    "2 Minute": "2m",
    "5 Minute": "5m",
    "15 Minute": "15m",
    "30 Minute": "30m",
    "60 Minute": "60m",
    "90 Minute": "90m",
    "1 Hour": "1h",
    "1 Day": "1d",
    "5 Day": "5d",
    "1 Week": "1wk",
    "1 Month": "1mo",
    "3 Month": "3mo",
};

export const Period = {
    "1 Day": "1d",
    "5 Day": "5d",
    "1 Month": "1mo",
    "3 Month": "3mo",
    "6 Month": "6mo",
    "1 Year": "1y",
    "2 Year": "2y",
    "5 Year": "5y",
    "10 Year": "10y",
    "Year to Date": "ytd",
    Max: "max",
};

export const IntervalOptions: { label: string; value: IntervalType }[] =
    Object.entries(Interval).map(([key, value]) => ({
        label: key,
        value,
    }));

export const PeriodOptions: { label: string; value: PeriodType }[] =
    Object.entries(Period).map(([key, value]) => ({
        label: key,
        value,
    }));

export type IntervalType = (typeof Interval)[keyof typeof Interval];
export type PeriodType = (typeof Period)[keyof typeof Period];
