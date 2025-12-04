import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/TranslationContext';

type DurationUnit = 't' | 'm' | 'h' | 'd';

interface HigherLowerPanelProps {
  authorized: boolean;
  balance: number;
  currency: string;
  currentPrice: number | null;
  onBuy: (type: 'HIGHER' | 'LOWER', stake: number, duration: number, durationUnit: DurationUnit, barrier: number) => Promise<void>;
  onError?: (error: string) => void;  // Report errors to parent for Amy help
}

const DURATION_UNITS: { id: DurationUnit; label: string; options: number[] }[] = [
  { id: 't', label: 'Ticks', options: [5, 10, 15, 20] },
  { id: 'm', label: 'Minutes', options: [1, 2, 5, 15, 30] },
  { id: 'h', label: 'Hours', options: [1, 2, 4, 8, 12] },
  { id: 'd', label: 'Days', options: [1, 2, 3, 7] },
];

export function HigherLowerPanel({
  authorized,
  balance,
  currency,
  currentPrice,
  onBuy,
  onError,
}: HigherLowerPanelProps) {
  const { t } = useTranslation();
  const [stake, setStake] = useState(10);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('t');
  const [duration, setDuration] = useState(5);
  const [barrier, setBarrier] = useState<number>(0);
  const [loading, setLoading] = useState<'HIGHER' | 'LOWER' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update barrier when current price changes (if not set)
  useEffect(() => {
    if (currentPrice && barrier === 0) {
      setBarrier(Math.round(currentPrice * 100) / 100);
    }
  }, [currentPrice, barrier]);

  const currentDurationUnit = DURATION_UNITS.find(u => u.id === durationUnit) || DURATION_UNITS[0];

  const handleDurationUnitChange = (unit: DurationUnit) => {
    setDurationUnit(unit);
    const unitConfig = DURATION_UNITS.find(u => u.id === unit);
    if (unitConfig) {
      setDuration(unitConfig.options[0]);
    }
  };

  const handleBuy = async (type: 'HIGHER' | 'LOWER') => {
    if (!authorized) {
      setError('Please connect your Deriv account first');
      return;
    }

    if (stake > balance) {
      setError('Insufficient balance');
      return;
    }

    if (stake < 0.35) {
      setError('Minimum stake is 0.35');
      return;
    }

    if (!barrier) {
      setError('Please set a barrier price');
      return;
    }

    setLoading(type);
    setError(null);
    setSuccess(null);

    try {
      await onBuy(type, stake, duration, durationUnit, barrier);
      setSuccess(`${type === 'HIGHER' ? 'Higher' : 'Lower'} contract purchased!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMsg);
      // Report to parent so user can ask Amy for help
      onError?.(errorMsg);
    } finally {
      setLoading(null);
    }
  };

  const presetStakes = [5, 10, 25, 50, 100];

  // Calculate barrier offset from current price
  const barrierOffset = currentPrice ? ((barrier - currentPrice) / currentPrice * 100).toFixed(2) : '0';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Higher/Lower
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Predict if price ends above or below barrier
        </p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Current Price & Barrier */}
        <div className="grid grid-cols-2 gap-2">
          {currentPrice && (
            <div className="text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('orderPanel.currentPrice')}</div>
              <div className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                {currentPrice.toFixed(2)}
              </div>
            </div>
          )}
          <div className="text-center py-2 bg-blue-500/10 rounded-lg">
            <div className="text-xs text-blue-600 dark:text-blue-400">Barrier</div>
            <div className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
              {barrier.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Barrier Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Barrier Price
            <span className={`ml-2 ${parseFloat(barrierOffset) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({parseFloat(barrierOffset) >= 0 ? '+' : ''}{barrierOffset}%)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={barrier}
              onChange={(e) => setBarrier(parseFloat(e.target.value) || 0)}
              step={0.01}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
            />
            <button
              onClick={() => currentPrice && setBarrier(Math.round(currentPrice * 100) / 100)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-600"
            >
              Reset
            </button>
          </div>
          
          {/* Quick Barrier Adjustments */}
          <div className="flex gap-2 mt-2">
            {[-1, -0.5, 0, +0.5, +1].map((offset) => (
              <button
                key={offset}
                onClick={() => currentPrice && setBarrier(Math.round((currentPrice * (1 + offset / 100)) * 100) / 100)}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  offset === 0
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {offset === 0 ? 'Spot' : `${offset > 0 ? '+' : ''}${offset}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Stake Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('orderPanel.stake')} ({currency})
          </label>
          <div className="relative">
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(0.35, parseFloat(e.target.value) || 0))}
              min={0.35}
              step={0.01}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-lg font-mono text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {currency}
            </div>
          </div>
          
          {/* Preset Stakes */}
          <div className="flex gap-2 mt-2">
            {presetStakes.map((preset) => (
              <button
                key={preset}
                onClick={() => setStake(preset)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  stake === preset
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('orderPanel.duration')}
          </label>
          
          {/* Duration Unit Tabs */}
          <div className="flex gap-1 mb-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {DURATION_UNITS.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleDurationUnitChange(unit.id)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  durationUnit === unit.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {unit.label}
              </button>
            ))}
          </div>
          
          {/* Duration Options */}
          <div className="flex gap-2">
            {currentDurationUnit.options.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  duration === d
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-500 flex-1">{error}</span>
            </div>
            {onError && (
              <button
                onClick={() => onError(error)}
                className="mt-2 w-full text-xs py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
              >
                💬 Ask Amy for help
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="text-xs text-green-500">{success}</span>
          </div>
        )}

        {/* Not authorized warning */}
        {!authorized && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span className="text-xs text-yellow-600 dark:text-yellow-500">
              {t('orderPanel.connectToTrade')}
            </span>
          </div>
        )}

        {/* Buy Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => handleBuy('HIGHER')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading === 'HIGHER' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Higher
              </>
            )}
          </button>
          
          <button
            onClick={() => handleBuy('LOWER')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading === 'LOWER' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <TrendingDown className="w-5 h-5" />
                Lower
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

