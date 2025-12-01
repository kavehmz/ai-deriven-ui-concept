import { memo } from 'react';
import { DerivPosition, Language, translations } from '../types';

interface PositionsProps {
  positions: DerivPosition[];
  language: Language;
  isAuthorized: boolean;
}

export const Positions = memo(function Positions({ positions, language, isAuthorized }: PositionsProps) {
  const t = translations[language];
  
  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.openPositions}</span>
        <div className="flex items-center gap-2">
          {!isAuthorized && (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
              Demo
            </span>
          )}
          <span className="text-xs text-deriv-text">{positions.length}</span>
        </div>
      </div>
      
      <div className="card-content space-y-3">
        {!isAuthorized ? (
          <div className="text-center py-6 space-y-2">
            <div className="text-4xl">🔒</div>
            <div className="text-sm text-deriv-text">
              Connect your Deriv API token to see real positions
            </div>
            <div className="text-xs text-deriv-text/60">
              Click "Connect API" in header
            </div>
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center text-deriv-text py-8">
            <div className="text-3xl mb-2">📭</div>
            {t.noPositions}
          </div>
        ) : (
          positions.map((position) => (
            <PositionCard key={position.contract_id} position={position} language={language} />
          ))
        )}
      </div>

      {/* Total P/L Footer */}
      {isAuthorized && positions.length > 0 && (
        <div className="p-3 border-t border-deriv-border dark:border-deriv-border light:border-deriv-lightBorder">
          <div className="flex justify-between items-center text-sm">
            <span className="text-deriv-text">{t.totalPnL}</span>
            <span className={`font-semibold ${totalPnL >= 0 ? 'price-up' : 'price-down'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USD
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

function PositionCard({ position, language }: { position: DerivPosition; language: Language }) {
  const t = translations[language];
  const isProfitable = position.pnl >= 0;
  
  // Get icon based on symbol
  const getIcon = (symbol: string) => {
    if (symbol.includes('GBP')) return '🇬🇧';
    if (symbol.includes('EUR')) return '🇪🇺';
    if (symbol.includes('USD')) return '🇺🇸';
    if (symbol.includes('JPY')) return '🇯🇵';
    if (symbol.includes('R_100')) return '💯';
    if (symbol.includes('R_75')) return '7️⃣';
    if (symbol.includes('R_50')) return '5️⃣';
    if (symbol.includes('R_25')) return '2️⃣';
    if (symbol.includes('R_10')) return '🔟';
    if (symbol.includes('BOOM')) return '💥';
    if (symbol.includes('CRASH')) return '📉';
    if (symbol.includes('R_')) return '📊';
    return '📈';
  };

  // Format symbol name
  const formatSymbol = (symbol: string) => {
    if (symbol === 'Unknown' || !symbol) return 'Loading...';
    // Convert R_100 to "Volatility 100"
    if (symbol.startsWith('R_')) {
      return `Vol ${symbol.replace('R_', '')} Index`;
    }
    return symbol;
  };

  // Format contract type
  const formatContractType = (type: string) => {
    const typeMap: Record<string, string> = {
      'CALL': '📈 Rise',
      'PUT': '📉 Fall',
      'DIGITOVER': 'Over',
      'DIGITUNDER': 'Under',
      'DIGITEVEN': 'Even',
      'DIGITODD': 'Odd',
      'MULTUP': '🔼 Multiplier Up',
      'MULTDOWN': '🔽 Multiplier Down',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="p-3 rounded-lg bg-white/5 dark:bg-white/5 light:bg-black/5 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIcon(position.symbol)}</span>
          <div>
            <div className="font-semibold text-sm">{formatSymbol(position.symbol)}</div>
            <div className="text-xs text-deriv-text">{formatContractType(position.contract_type)}</div>
          </div>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded ${isProfitable ? 'bg-deriv-green/20 text-deriv-green' : 'bg-deriv-red/20 text-deriv-red'}`}>
          {isProfitable ? '+' : ''}{position.pnl_percentage.toFixed(1)}%
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-deriv-text text-xs">Buy price:</div>
          <div className="font-mono font-medium">{position.buy_price.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-deriv-text text-xs">Current value:</div>
          <div className={`font-mono font-medium ${isProfitable ? 'price-up' : 'price-down'}`}>
            {position.current_price > 0 ? position.current_price.toFixed(2) : '---'}
          </div>
        </div>
      </div>

      {/* Total P/L */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="text-xs text-deriv-text">{t.profit}/{t.loss}</div>
          <div className={`text-lg font-semibold font-mono ${isProfitable ? 'price-up' : 'price-down'}`}>
            {isProfitable ? '+' : ''}{position.pnl.toFixed(2)} USD
          </div>
        </div>
        {/* Sell button */}
        <button className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-sm">
          Sell
        </button>
      </div>
    </div>
  );
}
