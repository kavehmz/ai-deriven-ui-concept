import { memo, useState } from 'react';
import { DerivBalance } from '../types';

interface HeaderProps {
  balance: DerivBalance | null;
  isConnected: boolean;
  onAuthorize: (token: string) => void;
  isAuthorized: boolean;
  authError: string | null;
}

export const Header = memo(function Header({ balance, isConnected, onAuthorize, isAuthorized, authError }: HeaderProps) {
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');

  const handleConnect = () => {
    if (showTokenInput && token.trim()) {
      onAuthorize(token.trim());
      setShowTokenInput(false);
      setToken('');
    } else {
      setShowTokenInput(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && token.trim()) {
      onAuthorize(token.trim());
      setShowTokenInput(false);
      setToken('');
    } else if (e.key === 'Escape') {
      setShowTokenInput(false);
      setToken('');
    }
  };

  return (
    <header className="h-16 bg-deriv-card dark:bg-deriv-card light:bg-white border-b border-deriv-border dark:border-deriv-border light:border-deriv-lightBorder flex items-center px-4 justify-between">
      {/* Logo & Nav */}
      <div className="flex items-center gap-6">
        {/* Deriv Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full accent-bg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-lg font-semibold hidden sm:inline">Deriv</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem icon="🏠" label="Trader's Hub" />
          <NavItem icon="💰" label="Cashier" />
          <NavItem icon="📊" label="Reports" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 dark:bg-white/5 light:bg-black/5">
            <span className="text-sm font-medium accent-text">DT</span>
            <span className="text-sm font-medium">deriv Trader</span>
            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Deposit Button */}
        <button className="btn-primary text-sm px-4 py-2 hidden sm:block">
          Deposit
        </button>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-deriv-green' : 'bg-deriv-red animate-pulse'}`} />
          <span className="text-xs text-deriv-text hidden sm:inline">
            {isConnected ? 'Live Data' : 'Connecting...'}
          </span>
        </div>

        {/* Auth Error */}
        {authError && (
          <div className="text-xs text-deriv-red max-w-[150px] truncate" title={authError}>
            ⚠️ {authError}
          </div>
        )}

        {/* Balance / Connect */}
        {isAuthorized && balance ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 dark:bg-white/5 light:bg-black/5">
            <div className="w-6 h-6 rounded-full bg-deriv-green/20 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-deriv-text">{balance.account_type}</div>
              <div className="font-semibold accent-text">
                {balance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {balance.currency}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {showTokenInput && (
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste API token..."
                className="input-field text-sm w-40"
                autoFocus
              />
            )}
            <button 
              onClick={handleConnect}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-deriv-green/20 flex items-center justify-center">
                <span className="text-xs">{showTokenInput ? '→' : '🔗'}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-deriv-text">Demo</div>
                <div className="font-semibold text-deriv-green">
                  {showTokenInput ? 'Submit' : 'Connect API'}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Profile */}
        <button className="w-10 h-10 rounded-full bg-white/5 dark:bg-white/5 light:bg-black/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  );
});

function NavItem({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 transition-colors">
      <span className="text-sm">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
