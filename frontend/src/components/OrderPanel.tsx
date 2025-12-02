import { useState } from 'react';
import { ArrowUp, ArrowDown, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/TranslationContext';

interface OrderPanelProps {
  authorized: boolean;
  balance: number;
  currency: string;
  currentPrice: number | null;
  onBuy: (type: 'CALL' | 'PUT', stake: number) => Promise<void>;
}

export function OrderPanel({
  authorized,
  balance,
  currency,
  currentPrice,
  onBuy,
}: OrderPanelProps) {
  const { t } = useTranslation();
  const [stake, setStake] = useState(10);
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState<'CALL' | 'PUT' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBuy = async (type: 'CALL' | 'PUT') => {
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

    setLoading(type);
    setError(null);
    setSuccess(null);

    try {
      await onBuy(type, stake);
      setSuccess(`${type === 'CALL' ? 'Rise' : 'Fall'} contract purchased!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(null);
    }
  };

  const presetStakes = [5, 10, 25, 50, 100];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('orderPanel.title')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t('orderPanel.subtitle')}
        </p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Current Price */}
        {currentPrice && (
          <div className="text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('orderPanel.currentPrice')}</div>
            <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {currentPrice.toFixed(2)}
            </div>
          </div>
        )}

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
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-lg font-mono text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
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

        {/* Duration (simplified) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('orderPanel.duration')}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((d) => (
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

        {/* Payout Info */}
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('orderPanel.potentialPayout')}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            ~{(stake * 1.95).toFixed(2)} {currency}
          </span>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-500">{error}</span>
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
            onClick={() => handleBuy('CALL')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading === 'CALL' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ArrowUp className="w-5 h-5" />
                {t('orderPanel.rise')}
              </>
            )}
          </button>
          
          <button
            onClick={() => handleBuy('PUT')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading === 'PUT' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ArrowDown className="w-5 h-5" />
                {t('orderPanel.fall')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

