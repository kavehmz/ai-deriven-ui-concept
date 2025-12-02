import { Wallet, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Account, Position } from '../types';
import { useTranslation } from '../i18n/TranslationContext';

interface PortfolioProps {
  account: Account | null;
  positions: Position[];
  authorized: boolean;
}

export function Portfolio({ account, positions, authorized }: PortfolioProps) {
  const { t } = useTranslation();
  const openPositions = positions.filter((p) => !p.is_sold);
  const totalInvested = openPositions.reduce((sum, p) => sum + (p.buy_price || 0), 0);
  const totalPL = openPositions.reduce((sum, p) => sum + (p.profit || 0), 0);
  const plPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <PieChart className="w-4 h-4 text-purple-500" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('portfolio.title')}
        </h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {!authorized ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('portfolio.connectToView')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balance Card */}
            <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('portfolio.availableBalance')}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {account?.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-sm font-normal text-gray-500">
                  {account?.currency}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Invested */}
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('portfolio.invested')}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {totalInvested.toFixed(2)}
                </div>
              </div>

              {/* P/L */}
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {totalPL >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  {t('portfolio.totalPL')}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    totalPL >= 0 ? 'profit' : 'loss'
                  }`}
                >
                  {totalPL >= 0 ? '+' : ''}
                  {totalPL.toFixed(2)}
                  <span className="text-xs ml-1">
                    ({plPercent >= 0 ? '+' : ''}
                    {plPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Positions Summary */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('portfolio.openPositions')}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {openPositions.length}
                </span>
              </div>
              
              {openPositions.length > 0 && (
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (openPositions.filter((p) => (p.profit || 0) >= 0).length /
                            openPositions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between text-xs mt-1 text-gray-400 dark:text-gray-500">
                <span>
                  {openPositions.filter((p) => (p.profit || 0) >= 0).length} {t('portfolio.profitable')}
                </span>
                <span>
                  {openPositions.filter((p) => (p.profit || 0) < 0).length} {t('portfolio.losing')}
                </span>
              </div>
            </div>

            {/* Account Info */}
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Account: {account?.loginid}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

