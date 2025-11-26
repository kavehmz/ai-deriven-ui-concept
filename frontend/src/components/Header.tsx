import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, RotateCcw } from 'lucide-react';
import { UIState } from '../types';

interface Props {
  uiState: UIState;
  onToggleTheme: () => void;
  onReset: () => void;
}

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ar: 'العربية',
};

export function Header({ uiState, onToggleTheme, onReset }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: uiState.primaryColor }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold">Amy</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-Driven Dynamic UI</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 dark:bg-black/20">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: uiState.primaryColor }}
            />
            <span className="text-xs font-mono">
              {languageNames[uiState.language] || uiState.language}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 dark:bg-black/20">
            <span className="text-xs">{uiState.layout}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 dark:bg-black/20">
            <span className="text-xs">{uiState.visibleComponents.length} components</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors"
            title="Toggle theme"
          >
            {uiState.theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -180 }}
            whileTap={{ scale: 0.9 }}
            onClick={onReset}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors"
            title="Reset UI"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

