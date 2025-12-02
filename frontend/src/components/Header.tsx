import { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Globe, 
  Settings, 
  LogIn, 
  LogOut, 
  Wallet,
  TrendingUp
} from 'lucide-react';
import { LANGUAGES } from '../types';

interface HeaderProps {
  theme: 'dark' | 'light';
  language: string;
  account: { balance: number; currency: string; loginid: string } | null;
  authorized: boolean;
  onThemeToggle: () => void;
  onLanguageChange: (lang: string) => void;
  onAuthorize: (token: string) => void;
  onLogout: () => void;
}

export function Header({
  theme,
  language,
  account,
  authorized,
  onThemeToggle,
  onLanguageChange,
  onAuthorize,
  onLogout,
}: HeaderProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');

  const handleAuthorize = () => {
    if (token.trim()) {
      onAuthorize(token.trim());
      setShowTokenInput(false);
      setToken('');
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Amy
          </span>
          <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
            AI Trading
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Account Balance */}
        {authorized && account && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg mr-2">
            <Wallet className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
              {account.balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {account.currency}
            </span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
            title="Change language"
          >
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              {language}
            </span>
          </button>
          
          {showLanguageMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLanguageMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 min-w-[150px]">
                {Object.entries(LANGUAGES).map(([code, { name }]) => (
                  <button
                    key={code}
                    onClick={() => {
                      onLanguageChange(code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      language === code
                        ? 'text-accent font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Settings placeholder */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Auth Button */}
        {authorized ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {account?.loginid}
            </span>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">Connect</span>
            </button>
            
            {showTokenInput && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowTokenInput(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-20 w-80">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Enter your Deriv API Token
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Get a token from{' '}
                    <a
                      href="https://app.deriv.com/account/api-token"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Deriv API Settings
                    </a>
                  </p>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Your API token"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 mb-3"
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthorize()}
                  />
                  <button
                    onClick={handleAuthorize}
                    disabled={!token.trim()}
                    className="w-full py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

