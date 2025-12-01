import { memo, useState } from 'react';
import { Language, translations } from '../types';
import { TradeParams, TradeResult } from '../hooks/useDerivAPI';

interface OrderPanelProps {
  language: Language;
  accentColor: string;
  currentPrice: number;
  symbol: string;
  isAuthorized: boolean;
  isTrading: boolean;
  onTrade: (params: TradeParams) => Promise<TradeResult>;
}

export const OrderPanel = memo(function OrderPanel({ 
  language, 
  accentColor: _accentColor, 
  currentPrice, 
  symbol,
  isAuthorized,
  isTrading,
  onTrade
}: OrderPanelProps) {
  void _accentColor; // Keep for future use
  const t = translations[language];
  const [stake, setStake] = useState(10);
  const [duration, setDuration] = useState(5);
  const [durationUnit, setDurationUnit] = useState<'t' | 'm'>('t'); // ticks or minutes
  const [contractType, setContractType] = useState<'CALL' | 'PUT'>('CALL');
  const [lastResult, setLastResult] = useState<TradeResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleTrade = async () => {
    if (!isAuthorized) {
      setLastResult({ success: false, error: 'Please connect your Deriv API token first' });
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
      return;
    }

    const result = await onTrade({
      symbol,
      contractType,
      duration,
      durationUnit,
      amount: stake,
      basis: 'stake'
    });

    setLastResult(result);
    setShowResult(true);
    setTimeout(() => setShowResult(false), 5000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span className="text-xs text-deriv-text">Trade</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Rise/Fall</span>
        </div>
        <button className="opacity-60 hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="card-content space-y-4">
        {/* Auth warning */}
        {!isAuthorized && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            ⚠️ Connect your API token to place real trades
          </div>
        )}

        {/* Trade result notification */}
        {showResult && lastResult && (
          <div className={`p-3 rounded-lg text-sm ${
            lastResult.success 
              ? 'bg-deriv-green/10 border border-deriv-green/30 text-deriv-green' 
              : 'bg-deriv-red/10 border border-deriv-red/30 text-deriv-red'
          }`}>
            {lastResult.success ? (
              <div>
                ✅ Trade placed! Contract #{lastResult.contractId}
                <div className="text-xs mt-1 opacity-80">
                  Buy: ${lastResult.buyPrice?.toFixed(2)} | Payout: ${lastResult.payout?.toFixed(2)}
                </div>
              </div>
            ) : (
              <div>❌ {lastResult.error}</div>
            )}
          </div>
        )}

        {/* Contract Type Selection */}
        <div>
          <div className="text-sm mb-2">Prediction</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setContractType('CALL')}
              className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                contractType === 'CALL'
                  ? 'bg-deriv-green text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Rise
            </button>
            <button
              onClick={() => setContractType('PUT')}
              className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                contractType === 'PUT'
                  ? 'bg-deriv-red text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Fall
            </button>
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Duration</span>
            <div className="flex gap-1">
              <button
                onClick={() => setDurationUnit('t')}
                className={`px-2 py-1 rounded text-xs ${
                  durationUnit === 't' ? 'accent-bg text-white' : 'bg-white/5'
                }`}
              >
                Ticks
              </button>
              <button
                onClick={() => setDurationUnit('m')}
                className={`px-2 py-1 rounded text-xs ${
                  durationUnit === 'm' ? 'accent-bg text-white' : 'bg-white/5'
                }`}
              >
                Minutes
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button 
              onClick={() => setDuration(Math.max(1, duration - 1))}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-transparent text-center text-lg font-mono border-none outline-none"
            />
            <span className="text-deriv-text text-sm pr-2">{durationUnit === 't' ? 'ticks' : 'min'}</span>
            <button 
              onClick={() => setDuration(duration + 1)}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stake */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">{t.stake}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button 
              onClick={() => setStake(Math.max(1, stake - 1))}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-transparent text-center text-lg font-mono border-none outline-none"
            />
            <span className="text-deriv-text text-sm pr-2">USD</span>
            <button 
              onClick={() => setStake(stake + 1)}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Price */}
        <div className="p-3 rounded-lg bg-white/5 text-center">
          <div className="text-xs text-deriv-text mb-1">Current spot price</div>
          <div className="text-2xl font-mono font-semibold">{currentPrice.toFixed(2)}</div>
          <div className="text-xs text-deriv-text mt-1">{symbol}</div>
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-1">
          {[5, 10, 25, 50].map((amount) => (
            <button
              key={amount}
              onClick={() => setStake(amount)}
              className={`py-2 rounded text-sm transition-all ${
                stake === amount ? 'accent-bg text-white' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Buy Button */}
      <div className="p-3 border-t border-deriv-border">
        <button 
          onClick={handleTrade}
          disabled={isTrading}
          className={`w-full py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
            isTrading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ 
            background: contractType === 'CALL'
              ? 'linear-gradient(135deg, #00c853 0%, #00c85388 100%)'
              : 'linear-gradient(135deg, #ff444f 0%, #ff444f88 100%)'
          }}
        >
          {isTrading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Placing trade...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {contractType === 'CALL' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                )}
              </svg>
              {contractType === 'CALL' ? 'Buy Rise' : 'Buy Fall'} - ${stake}
            </>
          )}
        </button>
      </div>
    </div>
  );
});
