import { useState, useEffect, useCallback, useRef } from 'react';
import { Tick, OHLC, Position, Account, MarketSymbol } from '../types';

const DERIV_WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089';

interface DerivAPIState {
  connected: boolean;
  authorized: boolean;
  account: Account | null;
  positions: Position[];
  tick: Tick | null;
  candles: OHLC[];
  symbols: MarketSymbol[];
  selectedSymbol: string;
  error: string | null;
}

export function useDerivAPI() {
  const [state, setState] = useState<DerivAPIState>({
    connected: false,
    authorized: false,
    account: null,
    positions: [],
    tick: null,
    candles: [],
    symbols: [],
    selectedSymbol: 'R_100',
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string | null>(null);
  const reqIdRef = useRef(0);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const getReqId = () => ++reqIdRef.current;

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...msg, req_id: getReqId() }));
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(DERIV_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
      
      // Get available symbols
      send({ active_symbols: 'brief', product_type: 'basic' });
      
      // Subscribe to ticks for default symbol
      send({ ticks: state.selectedSymbol, subscribe: 1 });
      subscriptionsRef.current.add('tick');
      
      // Get candles
      send({
        ticks_history: state.selectedSymbol,
        style: 'candles',
        granularity: 60,
        count: 100,
        end: 'latest',
      });

      // Authorize if we have a token
      if (tokenRef.current) {
        send({ authorize: tokenRef.current });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    ws.onerror = () => {
      setState((prev) => ({ ...prev, error: 'WebSocket error' }));
    };

    ws.onclose = () => {
      setState((prev) => ({ 
        ...prev, 
        connected: false, 
        authorized: false,
      }));
      subscriptionsRef.current.clear();
      
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
  }, [send, state.selectedSymbol]);

  const handleMessage = useCallback((data: Record<string, unknown>) => {
    if (data.error) {
      const errorMsg = (data.error as { message: string }).message || 'API error';
      console.error('Deriv API error:', data.error);
      setState((prev) => ({ 
        ...prev, 
        error: errorMsg,
      }));
      
      // Dispatch error event so pending promises can handle it
      window.dispatchEvent(
        new CustomEvent('deriv-error', { detail: { error: data.error, msg_type: data.msg_type } })
      );
      return;
    }

    // Handle tick data
    if (data.tick) {
      const tick = data.tick as { epoch: number; quote: number; symbol: string };
      setState((prev) => ({
        ...prev,
        tick: {
          epoch: tick.epoch,
          quote: tick.quote,
          symbol: tick.symbol,
        },
      }));
    }

    // Handle candles history
    if (data.candles) {
      const candles = (data.candles as Array<{ epoch: number; open: number; high: number; low: number; close: number }>).map((c) => ({
        time: c.epoch,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      setState((prev) => ({ ...prev, candles }));
    }

    // Handle OHLC stream
    if (data.ohlc) {
      const ohlc = data.ohlc as { epoch: number; open: string; high: string; low: string; close: string };
      const newCandle: OHLC = {
        time: ohlc.epoch,
        open: parseFloat(ohlc.open),
        high: parseFloat(ohlc.high),
        low: parseFloat(ohlc.low),
        close: parseFloat(ohlc.close),
      };
      setState((prev) => {
        const existing = prev.candles.findIndex((c) => c.time === newCandle.time);
        if (existing >= 0) {
          const updated = [...prev.candles];
          updated[existing] = newCandle;
          return { ...prev, candles: updated };
        }
        return { ...prev, candles: [...prev.candles, newCandle] };
      });
    }

    // Handle active symbols
    if (data.active_symbols) {
      const symbols = (data.active_symbols as Array<{ symbol: string; display_name: string; market: string; market_display_name: string }>)
        .filter((s) => s.market === 'synthetic_index')
        .map((s) => ({
          symbol: s.symbol,
          display_name: s.display_name,
          market: s.market,
          market_display_name: s.market_display_name,
        }));
      setState((prev) => ({ ...prev, symbols }));
    }

    // Handle authorization
    if (data.authorize) {
      const auth = data.authorize as { loginid: string; balance: number; currency: string };
      setState((prev) => ({
        ...prev,
        authorized: true,
        account: {
          loginid: auth.loginid,
          balance: auth.balance,
          currency: auth.currency,
        },
      }));
      
      // Subscribe to balance updates
      send({ balance: 1, subscribe: 1 });
      
      // Get open positions
      send({ portfolio: 1 });
      
      // Subscribe to transaction updates
      send({ transaction: 1, subscribe: 1 });
    }

    // Handle balance update
    if (data.balance) {
      const bal = data.balance as { balance: number; currency: string };
      setState((prev) => ({
        ...prev,
        account: prev.account
          ? { ...prev.account, balance: bal.balance, currency: bal.currency }
          : null,
      }));
    }

    // Handle portfolio
    if (data.portfolio) {
      const rawContracts = (data.portfolio as { contracts: unknown[] }).contracts || [];
      const contracts = rawContracts.map((contract) => {
        const c = contract as Record<string, unknown>;
        return {
          contract_id: c.contract_id as number,
          symbol: (c.symbol as string) || (c.underlying as string) || 'Unknown',
          underlying: (c.underlying as string) || (c.symbol as string) || 'Unknown',
          contract_type: c.contract_type as string,
          buy_price: c.buy_price as number,
          current_spot: c.current_spot as number,
          profit: (c.profit as number) || 0,
          payout: c.payout as number,
          entry_spot: c.entry_spot as number,
          is_sold: c.is_sold as number,
          currency: c.currency as string,
          longcode: c.longcode as string,
        };
      });
      setState((prev) => ({ ...prev, positions: contracts }));
    }

    // Handle proposal open contract (live P/L updates)
    if (data.proposal_open_contract) {
      const poc = data.proposal_open_contract as Record<string, unknown>;
      if (poc.contract_id) {
        setState((prev) => ({
          ...prev,
          positions: prev.positions.map((p) =>
            p.contract_id === poc.contract_id
              ? {
                  ...p,
                  current_spot: poc.current_spot as number,
                  profit: poc.profit as number,
                  is_sold: poc.is_sold as number,
                }
              : p
          ),
        }));
      }
    }

    // Handle transaction (new position or sold)
    if (data.transaction) {
      const txn = data.transaction as { action: string };
      if (txn.action === 'buy' || txn.action === 'sell') {
        // Refresh portfolio
        send({ portfolio: 1 });
      }
    }

    // Handle proposal (for getting contract ID before buying)
    if (data.proposal) {
      // Store proposal for later use in buy
      const proposal = data.proposal as { id: string };
      window.dispatchEvent(
        new CustomEvent('deriv-proposal', { detail: proposal })
      );
    }

    // Handle buy response
    if (data.buy) {
      const buy = data.buy as { contract_id: number; buy_price: number };
      window.dispatchEvent(
        new CustomEvent('deriv-buy', { detail: buy })
      );
      // Refresh portfolio
      send({ portfolio: 1 });
    }

    // Handle sell response
    if (data.sell) {
      const sell = data.sell as { contract_id: number; sold_for: number };
      window.dispatchEvent(
        new CustomEvent('deriv-sell', { detail: sell })
      );
      // Refresh portfolio
      send({ portfolio: 1 });
    }
  }, [send]);

  const authorize = useCallback((token: string) => {
    tokenRef.current = token;
    localStorage.setItem('deriv-token', token);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      send({ authorize: token });
    }
  }, [send]);

  const logout = useCallback(() => {
    tokenRef.current = null;
    localStorage.removeItem('deriv-token');
    setState((prev) => ({
      ...prev,
      authorized: false,
      account: null,
      positions: [],
    }));
    // Reconnect without authorization
    wsRef.current?.close();
  }, []);

  const selectSymbol = useCallback((symbol: string) => {
    setState((prev) => ({ ...prev, selectedSymbol: symbol, candles: [] }));
    
    // Unsubscribe from current and subscribe to new
    send({ forget_all: 'ticks' });
    send({ ticks: symbol, subscribe: 1 });
    send({
      ticks_history: symbol,
      style: 'candles',
      granularity: 60,
      count: 100,
      end: 'latest',
    });
  }, [send]);

  const buyContract = useCallback(
    async (contractType: 'CALL' | 'PUT' | 'HIGHER' | 'LOWER', stake: number, duration = 5, durationUnit: 't' | 'm' | 'h' | 'd' = 't', barrier?: number) => {
      return new Promise<{ contract_id: number; buy_price: number }>((resolve, reject) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        
        // Error handler for proposal errors
        const errorHandler = (e: CustomEvent) => {
          console.error('[Deriv] Proposal/Buy error:', e.detail);
          cleanup();
          reject(new Error(e.detail?.error?.message || 'Contract error'));
        };

        const cleanup = () => {
          clearTimeout(timeoutId);
          window.removeEventListener('deriv-proposal', proposalHandler as EventListener);
          window.removeEventListener('deriv-error', errorHandler as EventListener);
        };

        // First get a proposal
        const proposalHandler = (e: CustomEvent) => {
          window.removeEventListener('deriv-proposal', proposalHandler as EventListener);
          const proposal = e.detail as { id: string; error?: { message: string } };
          
          // Check for error in proposal response
          if (proposal.error) {
            cleanup();
            reject(new Error(proposal.error.message));
            return;
          }
          
          console.log('[Deriv] Proposal received:', proposal);
          
          // Now buy the contract
          const buyHandler = (e: CustomEvent) => {
            window.removeEventListener('deriv-buy', buyHandler as EventListener);
            cleanup();
            resolve(e.detail);
          };
          
          window.addEventListener('deriv-buy', buyHandler as EventListener);
          send({ buy: proposal.id, price: stake });
        };
        
        window.addEventListener('deriv-proposal', proposalHandler as EventListener);
        window.addEventListener('deriv-error', errorHandler as EventListener);
        
        // Map HIGHER/LOWER to CALL/PUT (Deriv API uses CALL/PUT with barrier)
        let apiContractType: 'CALL' | 'PUT' = 
          contractType === 'HIGHER' || contractType === 'CALL' ? 'CALL' : 'PUT';
        
        // Build proposal request
        const proposalRequest: Record<string, unknown> = {
          proposal: 1,
          amount: stake,
          basis: 'stake',
          contract_type: apiContractType,
          currency: state.account?.currency || 'USD',
          duration,
          duration_unit: durationUnit,
          symbol: state.selectedSymbol,
        };

        // Add barrier for Higher/Lower contracts (relative barrier format)
        if ((contractType === 'HIGHER' || contractType === 'LOWER') && barrier !== undefined) {
          // Use relative barrier format: +X or -X from spot price
          proposalRequest.barrier = barrier.toString();
        }

        console.log('[Deriv] Sending proposal:', proposalRequest);
        send(proposalRequest);

        // Timeout after 10 seconds
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Buy contract timeout - no response from server'));
        }, 10000);
      });
    },
    [send, state.account?.currency, state.selectedSymbol]
  );

  const sellContract = useCallback(
    (contractId: number) => {
      return new Promise<{ sold_for: number }>((resolve, reject) => {
        const sellHandler = (e: CustomEvent) => {
          window.removeEventListener('deriv-sell', sellHandler as EventListener);
          resolve(e.detail);
        };
        
        window.addEventListener('deriv-sell', sellHandler as EventListener);
        send({ sell: contractId, price: 0 });

        setTimeout(() => {
          window.removeEventListener('deriv-sell', sellHandler as EventListener);
          reject(new Error('Sell contract timeout'));
        }, 10000);
      });
    },
    [send]
  );

  const subscribeToPosition = useCallback(
    (contractId: number) => {
      send({ proposal_open_contract: 1, contract_id: contractId, subscribe: 1 });
    },
    [send]
  );

  // Initialize connection
  useEffect(() => {
    // Try to load saved token
    const savedToken = localStorage.getItem('deriv-token');
    if (savedToken) {
      tokenRef.current = savedToken;
    }
    
    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  // Subscribe to position updates when positions change
  useEffect(() => {
    for (const position of state.positions) {
      if (!position.is_sold) {
        subscribeToPosition(position.contract_id);
      }
    }
  }, [state.positions, subscribeToPosition]);

  return {
    ...state,
    authorize,
    logout,
    selectSymbol,
    buyContract,
    sellContract,
    send,
  };
}

