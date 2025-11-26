import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon } from 'lucide-react';
import { translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

export function Calculator({ language, primaryColor }: Props) {
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [entryPrice, setEntryPrice] = useState('43000');
  const [stopLoss, setStopLoss] = useState('42000');
  const t = translations[language] || translations.en;

  const accountSizeNum = parseFloat(accountSize) || 0;
  const riskPercentNum = parseFloat(riskPercent) || 0;
  const entryPriceNum = parseFloat(entryPrice) || 0;
  const stopLossNum = parseFloat(stopLoss) || 0;

  const riskAmount = accountSizeNum * (riskPercentNum / 100);
  const priceDiff = Math.abs(entryPriceNum - stopLossNum);
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const positionValue = positionSize * entryPriceNum;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <CalcIcon className="w-5 h-5" style={{ color: primaryColor }} />
        <h2 className="text-lg font-semibold">{t.calculator}</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            Account Size ($)
          </label>
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-sm border-none outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            Risk per Trade (%)
          </label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-sm border-none outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
              Entry Price
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-sm border-none outline-none focus:ring-2 transition-all"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
              Stop Loss
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-sm border-none outline-none focus:ring-2 transition-all"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Risk Amount:</span>
            <span className="font-mono font-semibold text-red-500">
              ${riskAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Position Size:</span>
            <span className="font-mono font-semibold">
              {positionSize.toFixed(6)} BTC
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Position Value:</span>
            <span className="font-mono font-semibold" style={{ color: primaryColor }}>
              ${positionValue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

