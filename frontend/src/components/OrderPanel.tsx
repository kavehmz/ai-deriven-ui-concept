import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Minus, Plus } from 'lucide-react';
import { translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

export function OrderPanel({ language, primaryColor }: Props) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0.01');
  const [price] = useState('43,250.00');
  const t = translations[language] || translations.en;

  const total = parseFloat(amount) * parseFloat(price.replace(/,/g, ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <ArrowUpDown className="w-5 h-5" style={{ color: primaryColor }} />
        <h2 className="text-lg font-semibold">{t.orderPanel}</h2>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('buy')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            orderType === 'buy'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          {t.buy}
        </button>
        <button
          onClick={() => setOrderType('sell')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            orderType === 'sell'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          {t.sell}
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">{t.amount} (BTC)</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAmount((prev) => Math.max(0.001, parseFloat(prev) - 0.01).toFixed(3))}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-center font-mono text-lg border-none outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
          <button
            onClick={() => setAmount((prev) => (parseFloat(prev) + 0.01).toFixed(3))}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">{t.price} (USD)</label>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-center font-mono text-lg">
          ${price}
        </div>
      </div>

      {/* Total */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="text-sm text-gray-500 dark:text-gray-400">{t.total}</div>
        <div className="text-xl font-bold font-mono">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
          orderType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {orderType === 'buy' ? t.buy : t.sell} BTC
      </motion.button>
    </motion.div>
  );
}

