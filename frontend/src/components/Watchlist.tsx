import { memo } from 'react';
import { MarketInfo, Language, translations } from '../types';

interface WatchlistProps {
  markets: MarketInfo[];
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
  language: Language;
}

export const Watchlist = memo(function Watchlist({ 
  markets, 
  selectedSymbol, 
  onSymbolSelect,
  language 
}: WatchlistProps) {
  const t = translations[language];

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.watchlist}</span>
        <button className="text-deriv-text hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <div className="card-content">
        <div className="space-y-1">
          {markets.map((market) => (
            <button
              key={market.symbol}
              onClick={() => onSymbolSelect(market.symbol)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                selectedSymbol === market.symbol 
                  ? 'bg-white/10 accent-border border' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold">
                  {market.symbol.substring(0, 2)}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium truncate max-w-[120px]">
                    {market.display_name}
                  </div>
                  <div className="text-xs text-deriv-text">{market.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">{market.quote.toFixed(2)}</div>
                <div className={`text-xs ${market.change >= 0 ? 'price-up' : 'price-down'}`}>
                  {market.change >= 0 ? '+' : ''}{market.change_percent.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

