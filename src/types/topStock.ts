// Used in dashboard
export type TopStock = {
    ticker: string;
    name?: string | null;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
};
