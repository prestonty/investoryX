import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TradeRecord } from './TradingActivityTable';

interface TradingActivityGraphProps {
  records: TradeRecord[];
}

export function TradingActivityGraph({ records }: TradingActivityGraphProps) {
  // Group records by symbol and aggregate data
  const chartData = records.reduce((acc, record) => {
    const timeKey = new Date(record.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const existing = acc.find((item) => item.time === timeKey && item.symbol === record.symbol);
    
    if (existing) {
      existing.totalVolume += record.volume;
      existing.trades.push(record);
    } else {
      acc.push({
        time: timeKey,
        symbol: record.symbol,
        price: record.price,
        totalVolume: record.volume,
        action: record.action,
        trades: [record],
      });
    }
    
    return acc;
  }, [] as any[]);

  // Create data for volume chart
  const volumeData = records.map((record, index) => ({
    name: new Date(record.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    volume: record.volume,
    price: record.price,
    symbol: record.symbol,
    action: record.action,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-light rounded-lg p-3 shadow-lg">
          <p className="text-dark font-medium">{payload[0].payload.symbol}</p>
          <p className="text-sm text-gray">Time: {payload[0].payload.name}</p>
          <p className="text-sm text-gray">Price: ${payload[0].payload.price?.toFixed(2)}</p>
          <p className="text-sm text-gray">Volume: {payload[0].value?.toLocaleString()}</p>
          <p className={`text-sm ${
            payload[0].payload.action === 'BUY' ? 'text-green' :
            payload[0].payload.action === 'SELL' ? 'text-red' :
            'text-blue'
          }`}>
            Action: {payload[0].payload.action}
          </p>
        </div>
      );
    }
    return null;
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-light p-12 flex items-center justify-center shadow-sm">
        <p className="text-gray">No trading data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-light p-6 space-y-6 shadow-sm">
      {/* Trading Volume Over Time */}
      <div>
        <h4 className="text-dark mb-4">Trading Volume Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EBED" />
            <XAxis
              dataKey="name"
              stroke="#7E8391"
              tick={{ fill: '#7E8391' }}
            />
            <YAxis
              stroke="#7E8391"
              tick={{ fill: '#7E8391' }}
              label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#7E8391' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Buy"
              data={volumeData.filter(d => d.action === 'BUY')}
              fill="#248E4F"
            />
            <Scatter
              name="Sell"
              data={volumeData.filter(d => d.action === 'SELL')}
              fill="#DF3F30"
            />
            <Scatter
              name="Hold"
              data={volumeData.filter(d => d.action === 'HOLD')}
              fill="#748EFE"
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Price Trends */}
      <div>
        <h4 className="text-dark mb-4">Price Trends</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={volumeData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EBED" />
            <XAxis
              dataKey="name"
              stroke="#7E8391"
              tick={{ fill: '#7E8391' }}
            />
            <YAxis
              stroke="#7E8391"
              tick={{ fill: '#7E8391' }}
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#7E8391' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#748EFE"
              strokeWidth={2}
              dot={{ fill: '#748EFE', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}