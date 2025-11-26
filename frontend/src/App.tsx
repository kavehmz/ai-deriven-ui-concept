import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIState } from './hooks/useUIState';
import { useChat } from './hooks/useChat';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { Watchlist } from './components/Watchlist';
import { Portfolio } from './components/Portfolio';
import { PriceChart } from './components/PriceChart';
import { OrderPanel } from './components/OrderPanel';
import { News } from './components/News';
import { MarketOverview } from './components/MarketOverview';
import { WorldClock } from './components/WorldClock';
import { Calculator } from './components/Calculator';

// Component registry
const componentRegistry: Record<string, React.ComponentType<{ language: string; primaryColor: string }>> = {
  watchlist: Watchlist,
  portfolio: Portfolio,
  chart: PriceChart,
  orderPanel: OrderPanel,
  news: News,
  marketOverview: MarketOverview,
  clock: WorldClock,
  calculator: Calculator,
};

function App() {
  const { uiState, applyUIUpdate, resetUI, setUIState } = useUIState();
  const { messages, isLoading, sendMessage } = useChat(uiState, applyUIUpdate);

  // Font size class
  const fontSizeClass = useMemo(() => {
    switch (uiState.fontSize) {
      case 'small': return 'text-size-small';
      case 'large': return 'text-size-large';
      default: return 'text-size-medium';
    }
  }, [uiState.fontSize]);

  // Grid layout based on visible components - uses auto-fill to avoid gaps
  const gridLayout = useMemo(() => {
    const count = uiState.visibleComponents.length;
    if (uiState.layout === 'compact') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    if (uiState.layout === 'expanded') {
      return 'grid-cols-1 lg:grid-cols-2';
    }
    // Standard layout - adapts based on component count
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';
  }, [uiState.visibleComponents.length, uiState.layout]);

  const toggleTheme = () => {
    setUIState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  return (
    <div 
      className={`min-h-screen gradient-bg ${fontSizeClass} text-gray-900 dark:text-white transition-colors duration-300`}
      dir={uiState.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto p-4 max-w-[1800px]">
        <Header 
          uiState={uiState}
          onToggleTheme={toggleTheme}
          onReset={resetUI}
        />

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Dashboard Area */}
          <div className="flex-1">
            <motion.div 
              layout
              className={`grid ${gridLayout} gap-4 auto-rows-auto`}
              style={{ gridAutoFlow: 'dense' }}
            >
              <AnimatePresence mode="popLayout">
                {uiState.visibleComponents.map((componentId) => {
                  const Component = componentRegistry[componentId];
                  if (!Component) return null;

                  // Chart spans 2 columns only when we have 3+ columns
                  const isWideChart = componentId === 'chart' && uiState.visibleComponents.length >= 4;

                  return (
                    <motion.div
                      key={componentId}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={isWideChart ? 'xl:col-span-2' : ''}
                    >
                      <Component 
                        language={uiState.language}
                        primaryColor={uiState.primaryColor}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            {uiState.visibleComponents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-12 text-center"
              >
                <p className="text-gray-500 dark:text-gray-400">
                  No components visible. Ask Amy to show some components!
                </p>
              </motion.div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              language={uiState.language}
              primaryColor={uiState.primaryColor}
            />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            AI-Driven Dynamic UI Demo • The interface adapts based on your conversation with Amy
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;

