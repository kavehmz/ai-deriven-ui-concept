import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioItem, translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

const portfolioData: PortfolioItem[] = [
  { symbol: 'BTC', name: 'Bitcoin', quantity: 0.5, avgPrice: 38000, currentPrice: 43250, pnl: 2625, pnlPercent: 13.82 },
  { symbol: 'ETH', name: 'Ethereum', quantity: 5, avgPrice: 2100, currentPrice: 2280, pnl: 900, pnlPercent: 8.57 },
  { symbol: 'AAPL', name: 'Apple', quantity: 25, avgPrice: 175, currentPrice: 190, pnl: 375, pnlPercent: 8.57 },
  { symbol: 'GOOGL', name: 'Alphabet', quantity: 10, avgPrice: 150, currentPrice: 142, pnl: -80, pnlPercent: -5.33 },
];

export function Portfolio({ language, primaryColor }: Props) {
  const t = translations[language] || translations.en;
  
  const totalValue = portfolioData.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0);
  const totalPnL = portfolioData.reduce((sum, item) => sum + item.pnl, 0);
  const totalPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5" style={{ color: primaryColor }} />
          {t.portfolio}
        </h2>
      </div>

      {/* Total Portfolio Value */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10">
        <div className="text-sm text-gray-600 dark:text-gray-400">{t.total}</div>
        <div className="text-2xl font-bold font-mono">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center gap-1 text-sm ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-mono">
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()} ({totalPnLPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 text-xs text-gray-500 dark:text-gray-400 px-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <span>{t.symbol}</span>
          <span className="text-right">{t.quantity}</span>
          <span className="text-right">{t.price}</span>
          <span className="text-right">{t.pnl}</span>
        </div>

        {portfolioData.map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="grid grid-cols-4 items-center p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors"
          >
            <div>
              <div className="font-mono font-semibold">{item.symbol}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.name}</div>
            </div>
            <div className="text-right font-mono">{item.quantity}</div>
            <div className="text-right font-mono">
              ${item.currentPrice.toLocaleString()}
            </div>
            <div className={`text-right font-mono text-sm ${item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.pnl >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

