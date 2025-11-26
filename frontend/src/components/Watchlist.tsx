import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Asset, translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

// Simulated market data
const initialAssets: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change: 1250.00, changePercent: 2.98, volume: '24.5B' },
  { symbol: 'ETH', name: 'Ethereum', price: 2280.50, change: -45.30, changePercent: -1.95, volume: '12.3B' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 189.95, change: 3.45, changePercent: 1.85, volume: '52.1M' },
  { symbol: 'GOOGL', name: 'Alphabet', price: 141.80, change: 2.10, changePercent: 1.50, volume: '18.7M' },
  { symbol: 'TSLA', name: 'Tesla', price: 248.50, change: -8.20, changePercent: -3.19, volume: '98.2M' },
];

export function Watchlist({ language, primaryColor }: Props) {
  const [assets, setAssets] = useState(initialAssets);
  const t = translations[language] || translations.en;

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          const changeAmount = (Math.random() - 0.5) * asset.price * 0.002;
          const newPrice = asset.price + changeAmount;
          const newChange = asset.change + changeAmount;
          const newChangePercent = (newChange / (asset.price - asset.change)) * 100;
          return {
            ...asset,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5" style={{ color: primaryColor }} />
          {t.watchlist}
        </h2>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-4 text-xs text-gray-500 dark:text-gray-400 px-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <span>{t.symbol}</span>
          <span className="text-right">{t.price}</span>
          <span className="text-right">{t.change}</span>
          <span className="text-right">{t.volume}</span>
        </div>

        {assets.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="grid grid-cols-4 items-center p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors cursor-pointer"
          >
            <div>
              <div className="font-mono font-semibold">{asset.symbol}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</div>
            </div>
            <div className="text-right font-mono">
              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-right flex items-center justify-end gap-1 ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="font-mono text-sm">
                {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 font-mono">
              {asset.volume}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

