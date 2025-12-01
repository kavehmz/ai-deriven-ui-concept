import { useState, useEffect, useCallback, useRef } from 'react';
import { DerivTick, DerivCandle, DerivBalance, MarketInfo, DerivPosition } from '../types';

const DERIV_WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089';

// Popular markets to show
const DEFAULT_SYMBOLS = [
  { symbol: 'R_100', name: 'Volatility 100 Index' },
  { symbol: 'R_75', name: 'Volatility 75 Index' },
  { symbol: 'R_50', name: 'Volatility 50 Index' },
  { symbol: 'R_25', name: 'Volatility 25 Index' },
  { symbol: 'R_10', name: 'Volatility 10 Index' },
  { symbol: 'BOOM1000', name: 'Boom 1000 Index' },
  { symbol: 'CRASH1000', name: 'Crash 1000 Index' },
  { symbol: 'stpRNG', name: 'Step Index' },
];

export interface TradeParams {
  symbol: string;
  contractType: 'CALL' | 'PUT';
  duration: number;
  durationUnit: 't' | 's' | 'm' | 'h' | 'd';
  amount: number;
  basis: 'stake' | 'payout';
}

export interface TradeResult {
  success: boolean;
  contractId?: string;
  buyPrice?: number;
  payout?: number;
  error?: string;
}

export interface UseDerivAPIReturn {
  isConnected: boolean;
  balance: DerivBalance | null;
  ticks: Record<string, DerivTick>;
  candles: DerivCandle[];
  markets: MarketInfo[];
  positions: DerivPosition[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  authorize: (token: string) => void;
  isAuthorized: boolean;
  authError: string | null;
  placeTrade: (params: TradeParams) => Promise<TradeResult>;
  isTrading: boolean;
}

export function useDerivAPI(): UseDerivAPIReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [balance, setBalance] = useState<DerivBalance | null>(null);
  const [ticks, setTicks] = useState<Record<string, DerivTick>>({});
  const [candles, setCandles] = useState<DerivCandle[]>([]);
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [positions, setPositions] = useState<DerivPosition[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('R_100');
  const [isTrading, setIsTrading] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const tickSubscriptionsRef = useRef<Set<string>>(new Set());
  const previousPrices = useRef<Record<string, number>>({});
  const tradeResolverRef = useRef<((result: TradeResult) => void) | null>(null);
  const proposalIdRef = useRef<string | null>(null);

  const handleMessage = useCallback((data: Record<string, unknown>) => {
    try {
      // Handle errors first
      if (data.error) {
        const error = data.error as { message: string; code?: string };
        console.error('Deriv API error:', error.message);
        
        // Check if it's an auth error
        if (error.code === 'InvalidToken' || error.message?.includes('token') || error.message?.includes('authorize')) {
          setAuthError(error.message);
          setIsAuthorized(false);
        }
        return;
      }

      // Handle tick updates
      if (data.tick) {
        const tick = data.tick as { symbol: string; quote: number; epoch: number };
        const prevPrice = previousPrices.current[tick.symbol] || tick.quote;
        const change = tick.quote - prevPrice;
        const changePercent = prevPrice !== 0 ? (change / prevPrice) * 100 : 0;
        
        setTicks(prev => ({
          ...prev,
          [tick.symbol]: {
            symbol: tick.symbol,
            quote: tick.quote,
            epoch: tick.epoch
          }
        }));

        // Update markets with change info
        setMarkets(prev => {
          const existing = prev.find(m => m.symbol === tick.symbol);
          const symbolInfo = DEFAULT_SYMBOLS.find(s => s.symbol === tick.symbol);
          
          if (existing) {
            return prev.map(m => 
              m.symbol === tick.symbol 
                ? { ...m, quote: tick.quote, change, change_percent: changePercent }
                : m
            );
          } else if (symbolInfo) {
            return [...prev, {
              symbol: tick.symbol,
              display_name: symbolInfo.name,
              market: 'synthetic',
              submarket: 'indices',
              pip: 0.01,
              quote: tick.quote,
              change: 0,
              change_percent: 0
            }];
          }
          return prev;
        });

        previousPrices.current[tick.symbol] = tick.quote;
      }

      // Handle OHLC updates for chart
      if (data.ohlc) {
        const ohlc = data.ohlc as { 
          open_time: number; 
          open: string; 
          high: string; 
          low: string; 
          close: string 
        };
        const newCandle: DerivCandle = {
          time: ohlc.open_time,
          open: parseFloat(ohlc.open),
          high: parseFloat(ohlc.high),
          low: parseFloat(ohlc.low),
          close: parseFloat(ohlc.close)
        };

        setCandles(prev => {
          const existingIndex = prev.findIndex(c => c.time === newCandle.time);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newCandle;
            return updated;
          }
          return [...prev, newCandle].slice(-100);
        });
      }

      // Handle candles history
      if (data.candles) {
        const candleData = (data.candles as Array<{
          epoch: number;
          open: number;
          high: number;
          low: number;
          close: number;
        }>).map(c => ({
          time: c.epoch,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }));
        setCandles(candleData);
      }

      // Handle authorization
      if (data.authorize) {
        const auth = data.authorize as { 
          balance?: number; 
          currency?: string; 
          loginid?: string; 
          account_type?: string;
          fullname?: string;
        };
        
        console.log('Authorization successful:', auth);
        setIsAuthorized(true);
        setAuthError(null);
        
        if (auth.balance !== undefined && auth.currency && auth.loginid) {
          setBalance({
            balance: auth.balance,
            currency: auth.currency,
            loginid: auth.loginid,
            account_type: auth.account_type || 'real'
          });
        }
        
        // Subscribe to balance updates
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ balance: 1, subscribe: 1 }));
          
          // Get open positions - proposal_open_contract is more reliable
          wsRef.current.send(JSON.stringify({ 
            portfolio: 1
          }));
        }
      }

      // Handle balance updates
      if (data.balance) {
        const bal = data.balance as { balance: number; currency: string };
        setBalance(prev => prev ? { ...prev, balance: bal.balance, currency: bal.currency } : null);
      }

      // Handle portfolio
      if (data.portfolio) {
        console.log('Portfolio response:', JSON.stringify(data.portfolio, null, 2));
        
        const portfolio = data.portfolio as { contracts?: Array<{
          contract_id: number;
          symbol?: string;           // The underlying symbol
          underlying?: string;       // Alternative field name
          contract_type: string;
          buy_price: number;
          bid_price?: number;        // Current sell price
          sell_price?: number;       // Alternative field
          payout?: number;
          profit?: number;
          purchase_time?: number;
          expiry_time?: number;
          currency?: string;
          longcode?: string;
        }> };
        
        if (portfolio.contracts && Array.isArray(portfolio.contracts)) {
          console.log('Found contracts:', portfolio.contracts.length);
          
          const mappedPositions = portfolio.contracts.map(c => {
            // Symbol can be in either 'symbol' or 'underlying' field
            const symbolName = c.symbol || c.underlying || 'Unknown';
            // Current price can be bid_price, sell_price, or we can calculate from buy_price + profit
            const currentPrice = c.bid_price || c.sell_price || (c.buy_price + (c.profit || 0)) || 0;
            
            console.log('Contract:', c.contract_id, 'Symbol:', symbolName, 'Buy:', c.buy_price, 'Current:', currentPrice);
            
            return {
              contract_id: String(c.contract_id),
              symbol: symbolName,
              contract_type: c.contract_type || 'Unknown',
              buy_price: c.buy_price || 0,
              current_price: currentPrice,
              pnl: c.profit || 0,
              pnl_percentage: c.buy_price ? ((c.profit || 0) / c.buy_price) * 100 : 0
            };
          });
          setPositions(mappedPositions);
          
          // Subscribe to proposal_open_contract for real-time updates on each contract
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            portfolio.contracts.forEach(c => {
              wsRef.current?.send(JSON.stringify({
                proposal_open_contract: 1,
                contract_id: c.contract_id,
                subscribe: 1
              }));
            });
          }
        } else {
          // No contracts - clear positions
          setPositions([]);
        }
      }
      
      // Handle real-time contract updates (proposal_open_contract)
      if (data.proposal_open_contract) {
        const contract = data.proposal_open_contract as {
          contract_id: number;
          underlying?: string;
          display_name?: string;
          contract_type: string;
          buy_price: number;
          bid_price?: number;
          current_spot?: number;
          profit?: number;
          profit_percentage?: number;
          status?: string;
          is_sold?: number;
        };
        
        console.log('Contract update:', contract.contract_id, 'Bid:', contract.bid_price, 'Profit:', contract.profit);
        
        // If contract is sold or expired, remove it and refresh portfolio
        if (contract.is_sold === 1 || contract.status === 'sold') {
          setPositions(prev => prev.filter(p => p.contract_id !== String(contract.contract_id)));
          // Refresh balance
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ balance: 1 }));
          }
        } else {
          // Update the position with real-time data
          setPositions(prev => prev.map(p => {
            if (p.contract_id === String(contract.contract_id)) {
              return {
                ...p,
                symbol: contract.underlying || contract.display_name || p.symbol,
                current_price: contract.bid_price || p.current_price,
                pnl: contract.profit || p.pnl,
                pnl_percentage: contract.profit_percentage || p.pnl_percentage
              };
            }
            return p;
          }));
        }
      }

      // Handle proposal response (for trading)
      if (data.proposal) {
        const proposal = data.proposal as { id: string; ask_price: number; payout: number };
        proposalIdRef.current = proposal.id;
        console.log('Got proposal:', proposal.id, 'Price:', proposal.ask_price);
        
        // Auto-buy with the proposal
        if (wsRef.current?.readyState === WebSocket.OPEN && proposalIdRef.current) {
          wsRef.current.send(JSON.stringify({
            buy: proposalIdRef.current,
            price: proposal.ask_price
          }));
        }
      }

      // Handle buy response
      if (data.buy) {
        const buy = data.buy as { 
          contract_id: number; 
          buy_price: number; 
          payout: number;
          longcode: string;
        };
        console.log('Trade executed:', buy);
        setIsTrading(false);
        
        if (tradeResolverRef.current) {
          tradeResolverRef.current({
            success: true,
            contractId: String(buy.contract_id),
            buyPrice: buy.buy_price,
            payout: buy.payout
          });
          tradeResolverRef.current = null;
        }

        // Refresh portfolio and balance
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ portfolio: 1 }));
          wsRef.current.send(JSON.stringify({ balance: 1 }));
        }
      }

      // Handle proposal/buy errors
      if (data.error && data.msg_type && ['proposal', 'buy'].includes(data.msg_type as string)) {
        const error = data.error as { message: string };
        console.error('Trade error:', error.message);
        setIsTrading(false);
        
        if (tradeResolverRef.current) {
          tradeResolverRef.current({
            success: false,
            error: error.message
          });
          tradeResolverRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error handling message:', err, data);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(DERIV_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Deriv WebSocket connected');
        setIsConnected(true);
        
        // Subscribe to default symbols for ticks
        DEFAULT_SYMBOLS.forEach(({ symbol }) => {
          ws.send(JSON.stringify({
            ticks: symbol,
            subscribe: 1
          }));
          tickSubscriptionsRef.current.add(symbol);
        });
        
        // Get candles for selected symbol
        ws.send(JSON.stringify({
          ticks_history: selectedSymbol,
          adjust_start_time: 1,
          count: 100,
          end: 'latest',
          start: 1,
          style: 'candles',
          granularity: 60,
          subscribe: 1
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      ws.onclose = () => {
        console.log('Deriv WebSocket closed');
        setIsConnected(false);
        tickSubscriptionsRef.current.clear();
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [selectedSymbol, handleMessage]);

  const authorize = useCallback((token: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setAuthError(null);
      console.log('Sending authorization request...');
      wsRef.current.send(JSON.stringify({ authorize: token }));
    } else {
      setAuthError('WebSocket not connected. Please wait and try again.');
    }
  }, []);

  const placeTrade = useCallback((params: TradeParams): Promise<TradeResult> => {
    return new Promise((resolve) => {
      if (!isAuthorized) {
        resolve({ success: false, error: 'Please connect your Deriv API token first' });
        return;
      }

      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        resolve({ success: false, error: 'WebSocket not connected' });
        return;
      }

      setIsTrading(true);
      tradeResolverRef.current = resolve;

      // Request a proposal first
      const proposalRequest = {
        proposal: 1,
        amount: params.amount,
        basis: params.basis,
        contract_type: params.contractType,
        currency: 'USD',
        duration: params.duration,
        duration_unit: params.durationUnit,
        symbol: params.symbol
      };

      console.log('Requesting proposal:', proposalRequest);
      wsRef.current.send(JSON.stringify(proposalRequest));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (tradeResolverRef.current) {
          setIsTrading(false);
          tradeResolverRef.current({ success: false, error: 'Trade request timed out' });
          tradeResolverRef.current = null;
        }
      }, 30000);
    });
  }, [isAuthorized]);

  // Subscribe to new symbol when it changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Get candles for new symbol
      wsRef.current.send(JSON.stringify({
        ticks_history: selectedSymbol,
        adjust_start_time: 1,
        count: 100,
        end: 'latest',
        start: 1,
        style: 'candles',
        granularity: 60,
        subscribe: 1
      }));
    }
  }, [selectedSymbol]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    balance,
    ticks,
    candles,
    markets,
    positions,
    selectedSymbol,
    setSelectedSymbol,
    authorize,
    isAuthorized,
    authError,
    placeTrade,
    isTrading
  };
}
