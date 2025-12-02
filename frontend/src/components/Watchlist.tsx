import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketSymbol } from '../types';

interface WatchlistProps {
  symbols: MarketSymbol[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

// Mock price data for demonstration
const mockPrices: Record<string, { price: number; change: number }> = {
  R_10: { price: 6523.45, change: 0.12 },
  R_25: { price: 3847.21, change: -0.08 },
  R_50: { price: 8234.67, change: 0.35 },
  R_75: { price: 12456.89, change: -0.21 },
  R_100: { price: 806.71, change: -0.03 },
  '1HZ10V': { price: 9876.54, change: 0.18 },
  '1HZ25V': { price: 4567.89, change: -0.14 },
  '1HZ50V': { price: 7654.32, change: 0.27 },
  '1HZ75V': { price: 11234.56, change: 0.09 },
  '1HZ100V': { price: 15678.90, change: -0.31 },
};

export function Watchlist({
  symbols,
  selectedSymbol,
  onSelectSymbol,
}: WatchlistProps) {
  // Show top volatility indices
  const watchlistSymbols = symbols.filter(
    (s) =>
      s.symbol.startsWith('R_') ||
      s.symbol.startsWith('1HZ')
  ).slice(0, 10);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Star className="w-4 h-4 text-yellow-500" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Watchlist
        </h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {watchlistSymbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Star className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading symbols...
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {watchlistSymbols.map((symbol) => {
              const priceData = mockPrices[symbol.symbol] || {
                price: 1000 + Math.random() * 10000,
                change: (Math.random() - 0.5) * 2,
              };
              const isPositive = priceData.change >= 0;

              return (
                <button
                  key={symbol.symbol}
                  onClick={() => onSelectSymbol(symbol.symbol)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    selectedSymbol === symbol.symbol
                      ? 'bg-accent/5 border-l-2 border-l-accent'
                      : ''
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {symbol.display_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {symbol.symbol}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                      {priceData.price.toFixed(2)}
                    </div>
                    <div
                      className={`flex items-center justify-end gap-1 text-xs ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositive ? '+' : ''}
                      {priceData.change.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

