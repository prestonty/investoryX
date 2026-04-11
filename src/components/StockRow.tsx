import { TopStock } from "@/types/topStock";
import Link from "next/link";

interface StockRowProps {
    stock: TopStock;
}

export default function StockRow({ stock }: StockRowProps) {
    const changeColor =
        stock.changePercent > 0
            ? "text-green"
            : stock.changePercent < 0
              ? "text-red"
              : "text-gray";

    const sign = stock.change > 0 ? "+" : "";

    return (
        <Link
            href={`/stock/${stock.ticker}`}
            className='flex justify-between items-center py-3 hover:bg-light transition-colors rounded-lg px-2 no-underline text-inherit'
        >
            <div className='flex flex-col gap-0.5'>
                <span className='text-dark font-extrabold text-[1.05rem]'>
                    {stock.ticker}
                </span>
                <span className='text-gray text-xs'>${stock.price}</span>
            </div>
            <div className='text-right'>
                <div className={`${changeColor} font-bold text-[0.95rem]`}>
                    {sign}${stock.change}
                </div>
                <div className={`${changeColor} font-semibold text-xs`}>
                    {sign}
                    {stock.changePercent}%
                </div>
            </div>
        </Link>
    );
}
