import { FaCircleMinus } from "react-icons/fa6";
import { GoArrowUpRight, GoArrowDownRight } from "react-icons/go";

export interface TradeRecord {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  volume: number;
  timestamp: Date;
}

interface TradingActivityTableProps {
  records: TradeRecord[];
}

export function TradingActivityTable({ records }: TradingActivityTableProps) {
  const getActionIcon = (action: TradeRecord['action']) => {
    switch (action) {
      case 'BUY':
        return <GoArrowUpRight className="size-4 text-[#248E4F]" />;
      case 'SELL':
        return <GoArrowDownRight className="size-4 text-[#DF3F30]" />;
      case 'HOLD':
        return <FaCircleMinus className="size-4 text-[#748EFE]" />;
    }
  };

  const getActionColor = (action: TradeRecord['action']) => {
    switch (action) {
      case 'BUY':
        return 'text-[#248E4F]';
      case 'SELL':
        return 'text-[#DF3F30]';
      case 'HOLD':
        return 'text-[#748EFE]';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E8EBED] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#E8EBED]/50 border-b border-[#E8EBED]">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-[#7E8391]">Action</th>
              <th className="text-left px-4 py-3 text-sm text-[#7E8391]">Symbol</th>
              <th className="text-left px-4 py-3 text-sm text-[#7E8391]">Price</th>
              <th className="text-left px-4 py-3 text-sm text-[#7E8391]">Volume</th>
              <th className="text-left px-4 py-3 text-sm text-[#7E8391]">Time</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-b border-[#E8EBED] hover:bg-[#E8EBED]/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getActionIcon(record.action)}
                    <span className={`font-medium ${getActionColor(record.action)}`}>
                      {record.action}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#181D2A] font-medium">{record.symbol}</td>
                <td className="px-4 py-3 text-[#181D2A]">${record.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-[#181D2A]">{record.volume.toLocaleString()}</td>
                <td className="px-4 py-3 text-[#7E8391] text-sm">
                  {formatDate(record.timestamp)}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#7E8391]">
                  No trading activity yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
