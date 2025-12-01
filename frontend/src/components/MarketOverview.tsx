import { memo } from 'react';
import { MarketInfo, Language, translations } from '../types';

interface MarketOverviewProps {
  markets: MarketInfo[];
  language: Language;
}

export const MarketOverview = memo(function MarketOverview({ markets, language }: MarketOverviewProps) {
  const t = translations[language];

  const gainers = [...markets].sort((a, b) => b.change_percent - a.change_percent).slice(0, 3);
  const losers = [...markets].sort((a, b) => a.change_percent - b.change_percent).slice(0, 3);
  const avgChange = markets.length > 0 
    ? markets.reduce((sum, m) => sum + m.change_percent, 0) / markets.length 
    : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.marketOverview}</span>
        <div className={`text-sm font-medium ${avgChange >= 0 ? 'price-up' : 'price-down'}`}>
          {avgChange >= 0 ? '▲' : '▼'} {Math.abs(avgChange).toFixed(2)}%
        </div>
      </div>
      
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4">
          {/* Gainers */}
          <div>
            <div className="text-xs text-deriv-text mb-2 uppercase tracking-wider">Top Gainers</div>
            <div className="space-y-2">
              {gainers.map((m) => (
                <div key={m.symbol} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[80px]">{m.display_name.split(' ')[1] || m.display_name.split(' ')[0]}</span>
                  <span className="price-up font-mono">+{m.change_percent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div>
            <div className="text-xs text-deriv-text mb-2 uppercase tracking-wider">Top Losers</div>
            <div className="space-y-2">
              {losers.map((m) => (
                <div key={m.symbol} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[80px]">{m.display_name.split(' ')[1] || m.display_name.split(' ')[0]}</span>
                  <span className="price-down font-mono">{m.change_percent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market sentiment */}
        <div className="mt-4 pt-4 border-t border-deriv-border">
          <div className="text-xs text-deriv-text mb-2">Market Sentiment</div>
          <div className="h-2 bg-deriv-border rounded-full overflow-hidden flex">
            <div 
              className="bg-deriv-green transition-all duration-500"
              style={{ width: `${50 + avgChange * 5}%` }}
            />
            <div className="bg-deriv-red flex-1" />
          </div>
          <div className="flex justify-between mt-1 text-xs text-deriv-text">
            <span>Bullish</span>
            <span>Bearish</span>
          </div>
        </div>
      </div>
    </div>
  );
});

