import { memo, useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, UTCTimestamp } from 'lightweight-charts';
import { DerivCandle, DerivTick, MarketInfo } from '../types';

interface PriceChartProps {
  candles: DerivCandle[];
  tick: DerivTick | undefined;
  markets: MarketInfo[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  theme: 'dark' | 'light';
  accentColor: string;
}

export const PriceChart = memo(function PriceChart({ 
  candles, 
  tick, 
  markets,
  selectedSymbol,
  onSymbolChange,
  theme,
  accentColor
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const currentMarket = markets.find(m => m.symbol === selectedSymbol);
  const currentPrice = tick?.quote ?? currentMarket?.quote ?? 0;
  const priceChange = currentMarket?.change ?? 0;
  const priceChangePercent = currentMarket?.change_percent ?? 0;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#c2c2c2' : '#333333',
      },
      grid: {
        vertLines: { color: isDark ? '#2a2a2a' : '#e0e0e0' },
        horzLines: { color: isDark ? '#2a2a2a' : '#e0e0e0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight - 60,
      rightPriceScale: {
        borderColor: isDark ? '#2a2a2a' : '#e0e0e0',
      },
      timeScale: {
        borderColor: isDark ? '#2a2a2a' : '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: accentColor,
          labelBackgroundColor: accentColor,
        },
        horzLine: {
          color: accentColor,
          labelBackgroundColor: accentColor,
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00c853',
      downColor: '#ff444f',
      borderUpColor: '#00c853',
      borderDownColor: '#ff444f',
      wickUpColor: '#00c853',
      wickDownColor: '#ff444f',
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight - 60,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [theme, accentColor]);

  // Update data
  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const data = candles.map(c => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles]);

  // Update latest tick
  useEffect(() => {
    if (seriesRef.current && tick && candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      if (lastCandle) {
        seriesRef.current.update({
          time: lastCandle.time as UTCTimestamp,
          open: lastCandle.open,
          high: Math.max(lastCandle.high, tick.quote),
          low: Math.min(lastCandle.low, tick.quote),
          close: tick.quote,
        });
      }
    }
  }, [tick, candles]);

  return (
    <div className="h-full flex flex-col">
      {/* Symbol selector */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {selectedSymbol.substring(0, 2)}
          </div>
          <div>
            <select 
              value={selectedSymbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              className="bg-transparent font-semibold text-lg cursor-pointer hover:opacity-80 border-none outline-none"
            >
              {markets.map(m => (
                <option key={m.symbol} value={m.symbol} className="bg-deriv-card text-white">
                  {m.display_name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-lg font-mono ${priceChange >= 0 ? 'price-up' : 'price-down'}`}>
                {currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm ${priceChange >= 0 ? 'price-up' : 'price-down'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)} ({Math.abs(priceChangePercent).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart tools */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-white/5 transition-colors" title="1 Tick">
            <span className="text-xs font-mono">1T</span>
          </button>
          <button className="p-2 rounded hover:bg-white/5 transition-colors" title="Indicators">
            <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button className="p-2 rounded hover:bg-white/5 transition-colors" title="Drawing tools">
            <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div ref={chartContainerRef} className="flex-1 relative">
        {candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-deriv-text">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {/* Time stats bar */}
      <div className="flex items-center justify-center gap-4 py-2 border-t border-deriv-border dark:border-deriv-border light:border-deriv-lightBorder text-xs text-deriv-text">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Stats
        </span>
        {[95, 1, 1, 27, 12, 17, 4, 64, 53, 6].map((num, i) => (
          <span key={i} className="font-mono">{num}</span>
        ))}
      </div>
    </div>
  );
});

