import { useState } from 'react';
import { Calculator as CalcIcon, RotateCcw } from 'lucide-react';

type CalcMode = 'position' | 'profit' | 'margin';

export function Calculator() {
  const [mode, setMode] = useState<CalcMode>('position');
  const [stake, setStake] = useState('10');
  const [payout, setPayout] = useState('95');
  const [winRate, setWinRate] = useState('55');
  const [trades, setTrades] = useState('10');

  const stakeNum = parseFloat(stake) || 0;
  const payoutNum = parseFloat(payout) || 0;
  const winRateNum = parseFloat(winRate) || 0;
  const tradesNum = parseInt(trades) || 0;

  // Position size calculator
  const positionProfit = stakeNum * (payoutNum / 100);
  const positionReturn = stakeNum + positionProfit;

  // Profit calculator
  const wins = Math.round(tradesNum * (winRateNum / 100));
  const losses = tradesNum - wins;
  const totalWinnings = wins * (stakeNum * (payoutNum / 100));
  const totalLosses = losses * stakeNum;
  const netProfit = totalWinnings - totalLosses;

  // Expected value
  const expectedValue =
    stakeNum * (payoutNum / 100) * (winRateNum / 100) -
    stakeNum * (1 - winRateNum / 100);

  const reset = () => {
    setStake('10');
    setPayout('95');
    setWinRate('55');
    setTrades('10');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Calculator
          </h2>
        </div>
        <button
          onClick={reset}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {(['position', 'profit'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === m
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {m === 'position' ? 'Position Size' : 'Profit Calc'}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {mode === 'position' ? (
          <div className="space-y-4">
            {/* Stake Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Stake Amount
              </label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>

            {/* Payout Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Payout Rate (%)
              </label>
              <input
                type="number"
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>

            {/* Results */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Potential Profit</span>
                <span className="font-medium profit">+{positionProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total Return</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {positionReturn.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Potential Loss</span>
                <span className="font-medium loss">-{stakeNum.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trade Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Stake
                </label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Payout %
                </label>
                <input
                  type="number"
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Win Rate %
                </label>
                <input
                  type="number"
                  value={winRate}
                  onChange={(e) => setWinRate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  # Trades
                </label>
                <input
                  type="number"
                  value={trades}
                  onChange={(e) => setTrades(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Wins / Losses
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  <span className="profit">{wins}</span> /{' '}
                  <span className="loss">{losses}</span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Net Profit</span>
                <span className={`font-medium ${netProfit >= 0 ? 'profit' : 'loss'}`}>
                  {netProfit >= 0 ? '+' : ''}
                  {netProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">EV per Trade</span>
                <span
                  className={`font-medium ${expectedValue >= 0 ? 'profit' : 'loss'}`}
                >
                  {expectedValue >= 0 ? '+' : ''}
                  {expectedValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

