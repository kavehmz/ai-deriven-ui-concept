import { motion } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

const marketIndices = [
  { name: 'S&P 500', value: 4567.89, change: 1.23 },
  { name: 'NASDAQ', value: 14234.56, change: 1.87 },
  { name: 'DOW', value: 35678.90, change: 0.45 },
  { name: 'BTC.D', value: 52.4, change: -0.32, suffix: '%' },
  { name: 'Fear & Greed', value: 67, change: 5, suffix: '' },
];

export function MarketOverview({ language, primaryColor }: Props) {
  const t = translations[language] || translations.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5" style={{ color: primaryColor }} />
        <h2 className="text-lg font-semibold">{t.marketOverview}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {marketIndices.map((index, i) => (
          <motion.div
            key={index.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl bg-white/5 dark:bg-black/20"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{index.name}</div>
            <div className="font-mono font-semibold">
              {index.suffix !== '' && !index.suffix ? '$' : ''}
              {index.value.toLocaleString()}
              {index.suffix || ''}
            </div>
            <div className={`flex items-center gap-1 text-xs ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {index.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {index.change >= 0 ? '+' : ''}{index.change}%
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

