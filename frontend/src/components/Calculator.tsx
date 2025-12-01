import { memo, useState } from 'react';
import { Language, translations } from '../types';

interface CalculatorProps {
  language: Language;
  accentColor: string;
}

export const Calculator = memo(function Calculator({ language, accentColor }: CalculatorProps) {
  const t = translations[language];
  
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(10);
  const [stopLoss, setStopLoss] = useState(20);
  const [takeProfit, setTakeProfit] = useState(50);

  const potentialProfit = stake * (takeProfit / 100);
  const potentialLoss = stake * (stopLoss / 100);
  const riskRewardRatio = potentialProfit / potentialLoss;
  const effectiveStake = stake * multiplier;

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.calculator}</span>
        <button className="text-deriv-text hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="card-content space-y-4">
        {/* Stake Input */}
        <div>
          <label className="text-xs text-deriv-text block mb-1">{t.stake} (USD)</label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
            className="input-field"
          />
        </div>

        {/* Multiplier */}
        <div>
          <label className="text-xs text-deriv-text block mb-1">Multiplier</label>
          <div className="grid grid-cols-5 gap-1">
            {[5, 10, 20, 50, 100].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`py-2 rounded text-sm transition-all ${
                  multiplier === m 
                    ? 'accent-bg text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                x{m}
              </button>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="text-xs text-deriv-text block mb-1">Stop Loss (%)</label>
          <input
            type="range"
            min="5"
            max="100"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor }}
          />
          <div className="flex justify-between text-xs text-deriv-text">
            <span>5%</span>
            <span className="font-medium text-deriv-red">{stopLoss}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Take Profit */}
        <div>
          <label className="text-xs text-deriv-text block mb-1">Take {t.profit} (%)</label>
          <input
            type="range"
            min="5"
            max="200"
            value={takeProfit}
            onChange={(e) => setTakeProfit(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor }}
          />
          <div className="flex justify-between text-xs text-deriv-text">
            <span>5%</span>
            <span className="font-medium text-deriv-green">{takeProfit}%</span>
            <span>200%</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2 pt-4 border-t border-deriv-border">
          <div className="flex justify-between text-sm">
            <span className="text-deriv-text">Effective Stake</span>
            <span className="font-mono">${effectiveStake.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-deriv-text">Potential {t.profit}</span>
            <span className="font-mono price-up">+${potentialProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-deriv-text">Potential {t.loss}</span>
            <span className="font-mono price-down">-${potentialLoss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-deriv-text">Risk/Reward</span>
            <span className={`font-mono ${riskRewardRatio >= 2 ? 'price-up' : 'text-yellow-500'}`}>
              1:{riskRewardRatio.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

