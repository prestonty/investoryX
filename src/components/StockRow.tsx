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
            className='flex justify-between items-center gap-3 py-3 hover:bg-light transition-colors rounded-lg px-2 no-underline text-inherit'
        >
            <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
                <div className='flex items-baseline gap-2 min-w-0'>
                    <span className='text-dark font-extrabold text-[1.05rem] shrink-0'>
                        {stock.ticker}
                    </span>
                    {stock.name && (
                        <span
                            className='text-gray text-xs truncate'
                            title={stock.name}
                        >
                            {stock.name}
                        </span>
                    )}
                </div>
                <span className='text-gray text-xs'>${stock.price}</span>
            </div>
            <div className='text-right shrink-0'>
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
