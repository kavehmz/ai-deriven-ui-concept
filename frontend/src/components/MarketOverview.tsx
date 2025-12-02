import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketData {
  name: string;
  value: string;
  change: number;
  volume: string;
}

const marketData: MarketData[] = [
  { name: 'Volatility 10 Index', value: '6,523.45', change: 0.12, volume: '12.5M' },
  { name: 'Volatility 25 Index', value: '3,847.21', change: -0.08, volume: '8.2M' },
  { name: 'Volatility 50 Index', value: '8,234.67', change: 0.35, volume: '15.1M' },
  { name: 'Volatility 75 Index', value: '12,456.89', change: -0.21, volume: '9.8M' },
  { name: 'Volatility 100 Index', value: '806.71', change: -0.03, volume: '22.3M' },
];

export function MarketOverview() {
  const gainers = marketData.filter((m) => m.change > 0).length;
  const losers = marketData.filter((m) => m.change < 0).length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <BarChart3 className="w-4 h-4 text-blue-500" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Market Overview
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {gainers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Gainers</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {losers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Losers</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            67.8M
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Volume</div>
        </div>
      </div>

      {/* Market List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {marketData.map((market) => (
            <div
              key={market.name}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {market.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Vol: {market.volume}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                  {market.value}
                </div>
                <div
                  className={`flex items-center justify-end gap-1 text-xs ${
                    market.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {market.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {market.change >= 0 ? '+' : ''}
                  {market.change.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

