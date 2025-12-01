import { memo } from 'react';
import { DerivBalance, Language, translations } from '../types';

interface PortfolioProps {
  balance: DerivBalance | null;
  language: Language;
  accentColor: string;
}

export const Portfolio = memo(function Portfolio({ balance, language, accentColor }: PortfolioProps) {
  const t = translations[language];
  
  // Demo balance if not authorized
  const displayBalance = balance || {
    balance: 9819.26,
    currency: 'USD',
    loginid: 'VRTC1234567',
    account_type: 'Demo'
  };

  // Mock portfolio breakdown
  const breakdown = [
    { label: 'Available', value: displayBalance.balance * 0.85, color: accentColor },
    { label: 'In trades', value: displayBalance.balance * 0.12, color: '#00c853' },
    { label: 'Reserved', value: displayBalance.balance * 0.03, color: '#ffc107' },
  ];

  const total = breakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.portfolio}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-deriv-green/20 text-deriv-green">
          {displayBalance.account_type}
        </span>
      </div>
      
      <div className="card-content">
        {/* Total Balance */}
        <div className="text-center mb-4">
          <div className="text-xs text-deriv-text mb-1">{t.balance}</div>
          <div className="text-3xl font-bold" style={{ color: accentColor }}>
            {displayBalance.balance.toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
          <div className="text-sm text-deriv-text">{displayBalance.currency}</div>
        </div>

        {/* Progress bar breakdown */}
        <div className="h-3 rounded-full overflow-hidden flex mb-3">
          {breakdown.map((item, i) => (
            <div 
              key={i}
              className="transition-all duration-500"
              style={{ 
                width: `${(item.value / total) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-deriv-text">{item.label}</span>
              </div>
              <span className="font-mono">
                {item.value.toLocaleString('en-US', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })} {displayBalance.currency}
              </span>
            </div>
          ))}
        </div>

        {/* Account ID */}
        <div className="mt-4 pt-4 border-t border-deriv-border text-center">
          <div className="text-xs text-deriv-text">Account ID</div>
          <div className="font-mono text-sm">{displayBalance.loginid}</div>
        </div>
      </div>
    </div>
  );
});

