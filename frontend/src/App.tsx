import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDerivAPI } from './hooks/useDerivAPI';
import { useChat } from './hooks/useChat';
import { useUIState } from './hooks/useUIState';
import { UIState, ComponentsConfig } from './types';

// Components
import { Header } from './components/Header';
import { PriceChart } from './components/PriceChart';
import { Positions } from './components/Positions';
import { OrderPanel } from './components/OrderPanel';
import { Watchlist } from './components/Watchlist';
import { MarketOverview } from './components/MarketOverview';
import { News } from './components/News';
import { Portfolio } from './components/Portfolio';
import { WorldClock } from './components/WorldClock';
import { Calculator } from './components/Calculator';
import { ChatPanel } from './components/ChatPanel';

function App() {
  const derivAPI = useDerivAPI();
  const chat = useChat();
  const ui = useUIState();

  // Handle chat messages and apply UI changes
  const handleSendMessage = useCallback(async (message: string, currentUI: UIState) => {
    const response = await chat.sendMessage(message, currentUI);
    
    if (response?.uiChanges) {
      ui.applyUIChanges(response.uiChanges);
    }
  }, [chat, ui]);

  const currentPrice = derivAPI.ticks[derivAPI.selectedSymbol]?.quote ?? 0;

  // Animation variants for grid items
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  // Render component based on key
  const renderComponent = (key: keyof ComponentsConfig) => {
    switch (key) {
      case 'chart':
        return (
          <PriceChart
            candles={derivAPI.candles}
            tick={derivAPI.ticks[derivAPI.selectedSymbol]}
            markets={derivAPI.markets}
            selectedSymbol={derivAPI.selectedSymbol}
            onSymbolChange={derivAPI.setSelectedSymbol}
            theme={ui.uiState.theme}
            accentColor={ui.uiState.accentColor}
          />
        );
      case 'positions':
        return (
          <Positions
            positions={derivAPI.positions}
            language={ui.uiState.language}
            isAuthorized={derivAPI.isAuthorized}
          />
        );
      case 'watchlist':
        return (
          <Watchlist
            markets={derivAPI.markets}
            selectedSymbol={derivAPI.selectedSymbol}
            onSymbolSelect={derivAPI.setSelectedSymbol}
            language={ui.uiState.language}
          />
        );
      case 'orderPanel':
        return (
          <OrderPanel
            language={ui.uiState.language}
            accentColor={ui.uiState.accentColor}
            currentPrice={currentPrice}
            symbol={derivAPI.selectedSymbol}
            isAuthorized={derivAPI.isAuthorized}
            isTrading={derivAPI.isTrading}
            onTrade={derivAPI.placeTrade}
          />
        );
      case 'marketOverview':
        return (
          <MarketOverview
            markets={derivAPI.markets}
            language={ui.uiState.language}
          />
        );
      case 'news':
        return (
          <News language={ui.uiState.language} />
        );
      case 'portfolio':
        return (
          <Portfolio
            balance={derivAPI.balance}
            language={ui.uiState.language}
            accentColor={ui.uiState.accentColor}
          />
        );
      case 'clock':
        return (
          <WorldClock language={ui.uiState.language} />
        );
      case 'calculator':
        return (
          <Calculator
            language={ui.uiState.language}
            accentColor={ui.uiState.accentColor}
          />
        );
      default:
        return null;
    }
  };

  // Get sorted visible components
  const sortedComponents = ui.getVisibleComponentsSorted();

  return (
    <div 
      className={`min-h-screen ${ui.uiState.theme === 'dark' ? 'bg-deriv-dark text-white' : 'bg-gray-100 text-gray-900'}`}
      dir={ui.uiState.language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <Header
        balance={derivAPI.balance}
        isConnected={derivAPI.isConnected}
        onAuthorize={derivAPI.authorize}
        isAuthorized={derivAPI.isAuthorized}
        authError={derivAPI.authError}
      />

      {/* Main Grid */}
      <main className="trading-grid">
        <AnimatePresence mode="popLayout">
          {sortedComponents.map(({ key, config }) => (
            <motion.div
              key={key}
              layout
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ 
                duration: 0.3, 
                ease: 'easeInOut',
                layout: { duration: 0.3 }
              }}
              className={`grid-item component-${key} grid-size-${config.size}`}
            >
              {renderComponent(key)}
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Floating Chat */}
      <ChatPanel
        messages={chat.messages}
        isLoading={chat.isLoading}
        onSendMessage={handleSendMessage}
        currentUI={ui.uiState}
        accentColor={ui.uiState.accentColor}
        language={ui.uiState.language}
        layoutDescription={ui.getLayoutDescription()}
      />
    </div>
  );
}

export default App;
