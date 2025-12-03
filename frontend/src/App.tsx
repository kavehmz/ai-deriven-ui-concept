import { useCallback } from 'react';
import { Header } from './components/Header';
import { PriceChart } from './components/PriceChart';
import { OrderPanel } from './components/OrderPanel';
import { Positions } from './components/Positions';
import { Watchlist } from './components/Watchlist';
import { MarketOverview } from './components/MarketOverview';
import { News } from './components/News';
import { Portfolio } from './components/Portfolio';
import { WorldClock } from './components/WorldClock';
import { Calculator } from './components/Calculator';
import { ChatPanel } from './components/ChatPanel';
import { useUIState } from './hooks/useUIState';
import { useDerivAPI } from './hooks/useDerivAPI';
import { useChat } from './hooks/useChat';
import { ComponentId, UserContext } from './types';
import { TranslationProvider } from './i18n/TranslationContext';

function App() {
  const {
    layout,
    visibleComponents,
    highlightedComponents,
    applyUIChanges,
    setTheme,
    setLanguage,
  } = useUIState();

  const {
    connected,
    authorized,
    account,
    positions,
    tick,
    candles,
    symbols,
    selectedSymbol,
    authorize,
    logout,
    selectSymbol,
    buyContract,
    sellContract,
  } = useDerivAPI();

  const getLayoutState = useCallback(() => layout, [layout]);

  const getUserContext = useCallback((): UserContext => {
    const openPositions = positions.filter((p) => !p.is_sold);
    const totalProfit = openPositions.reduce((sum, p) => sum + (p.profit || 0), 0);
    const totalInvested = openPositions.reduce((sum, p) => sum + (p.buy_price || 0), 0);
    
    return {
      isAuthenticated: authorized,
      accountType: account?.loginid?.startsWith('VRTC') ? 'demo' : 'real',
      accountId: account?.loginid,
      currency: account?.currency,
      balance: account?.balance,
      openPositionsCount: openPositions.length,
      totalProfit,
      totalInvested,
    };
  }, [authorized, account, positions]);

  const {
    messages,
    isLoading,
    isOpen,
    hasNewMessage,
    sendMessage,
    toggleChat,
    clearHistory,
  } = useChat({
    onUIChanges: applyUIChanges,
    getLayoutState,
    getUserContext,
  });

  const handleThemeToggle = () => {
    setTheme(layout.theme === 'dark' ? 'light' : 'dark');
  };

  const handleBuy = async (type: 'CALL' | 'PUT', stake: number) => {
    await buyContract(type, stake);
  };

  const handleSell = async (contractId: number) => {
    await sellContract(contractId);
  };

  const getSizeClass = (componentId: ComponentId) => {
    const size = layout.components[componentId]?.size || 'medium';
    return `component-${size}`;
  };

  const renderComponent = (componentId: ComponentId) => {
    const minHeights: Record<ComponentId, string> = {
      chart: 'min-h-[350px]',
      orderPanel: 'min-h-[400px]',
      positions: 'min-h-[250px]',
      watchlist: 'min-h-[300px]',
      marketOverview: 'min-h-[300px]',
      news: 'min-h-[300px]',
      portfolio: 'min-h-[300px]',
      clock: 'min-h-[280px]',
      calculator: 'min-h-[320px]',
    };

    const componentProps: Record<ComponentId, React.ReactNode> = {
      chart: (
        <PriceChart
          candles={candles}
          tick={tick}
          symbols={symbols}
          selectedSymbol={selectedSymbol}
          onSymbolChange={selectSymbol}
          theme={layout.theme}
        />
      ),
      orderPanel: (
        <OrderPanel
          authorized={authorized}
          balance={account?.balance || 0}
          currency={account?.currency || 'USD'}
          currentPrice={tick?.quote || null}
          onBuy={handleBuy}
        />
      ),
      positions: (
        <Positions
          positions={positions}
          authorized={authorized}
          onSell={handleSell}
        />
      ),
      watchlist: (
        <Watchlist
          symbols={symbols}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={selectSymbol}
        />
      ),
      marketOverview: <MarketOverview />,
      news: <News />,
      portfolio: (
        <Portfolio
          account={account}
          positions={positions}
          authorized={authorized}
        />
      ),
      clock: <WorldClock />,
      calculator: <Calculator />,
    };

    const isHighlighted = highlightedComponents.has(componentId);

    return (
      <div
        key={componentId}
        className={`${getSizeClass(componentId)} ${minHeights[componentId]} fade-in ${
          isHighlighted ? 'component-highlight' : ''
        }`}
      >
        {componentProps[componentId]}
      </div>
    );
  };

  return (
    <TranslationProvider language={layout.language}>
      <div
        className={`min-h-screen bg-gray-100 dark:bg-gray-950 ${
          layout.theme === 'dark' ? 'dark' : ''
        }`}
      >
        {/* Header */}
        <Header
          theme={layout.theme}
          language={layout.language}
          account={account}
          authorized={authorized}
          onThemeToggle={handleThemeToggle}
          onLanguageChange={setLanguage}
          onAuthorize={authorize}
          onLogout={logout}
        />

        {/* Connection Status */}
        {!connected && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
            <p className="text-xs text-yellow-600 dark:text-yellow-500 text-center">
              Connecting to Deriv API...
            </p>
          </div>
        )}

        {/* Main Content */}
        <main className="components-grid pb-24">
          {visibleComponents.map((componentId) => renderComponent(componentId))}

          {/* Empty state when no components visible */}
          {visibleComponents.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your canvas is empty
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                Chat with Amy to add components to your workspace. Try saying
                "Show me a trading layout" or "Add the chart and positions".
              </p>
            </div>
          )}
        </main>

        {/* Floating Chat */}
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          isOpen={isOpen}
          hasNewMessage={hasNewMessage}
          onSendMessage={sendMessage}
          onToggle={toggleChat}
          onClear={clearHistory}
        />
      </div>
    </TranslationProvider>
  );
}

export default App;

