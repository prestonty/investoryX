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
        return <GoArrowUpRight className="size-4 text-green" />;
      case 'SELL':
        return <GoArrowDownRight className="size-4 text-red" />;
      case 'HOLD':
        return <FaCircleMinus className="size-4 text-blue" />;
    }
  };

  const getActionColor = (action: TradeRecord['action']) => {
    switch (action) {
      case 'BUY':
        return 'text-green';
      case 'SELL':
        return 'text-red';
      case 'HOLD':
        return 'text-blue';
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
    <div className="bg-white rounded-lg border border-light overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-light/50 border-b border-light">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-gray">Action</th>
              <th className="text-left px-4 py-3 text-sm text-gray">Symbol</th>
              <th className="text-left px-4 py-3 text-sm text-gray">Price</th>
              <th className="text-left px-4 py-3 text-sm text-gray">Volume</th>
              <th className="text-left px-4 py-3 text-sm text-gray">Time</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-b border-light hover:bg-light/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getActionIcon(record.action)}
                    <span className={`font-medium ${getActionColor(record.action)}`}>
                      {record.action}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-dark font-medium">{record.symbol}</td>
                <td className="px-4 py-3 text-dark">${record.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-dark">{record.volume.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray text-sm">
                  {formatDate(record.timestamp)}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray">
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
