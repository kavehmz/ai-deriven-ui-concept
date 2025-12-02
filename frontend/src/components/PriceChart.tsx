import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { OHLC, Tick, MarketSymbol } from '../types';

interface PriceChartProps {
  candles: OHLC[];
  tick: Tick | null;
  symbols: MarketSymbol[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  theme: 'dark' | 'light';
}

export function PriceChart({
  candles,
  tick,
  symbols,
  selectedSymbol,
  onSymbolChange,
  theme,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const selectedSymbolInfo = symbols.find((s) => s.symbol === selectedSymbol);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: theme === 'dark' ? '#9CA3AF' : '#6B7280',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1F2937' : '#E5E7EB' },
        horzLines: { color: theme === 'dark' ? '#1F2937' : '#E5E7EB' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: theme === 'dark' ? '#4B5563' : '#9CA3AF',
          labelBackgroundColor: theme === 'dark' ? '#374151' : '#6B7280',
        },
        horzLine: {
          color: theme === 'dark' ? '#4B5563' : '#9CA3AF',
          labelBackgroundColor: theme === 'dark' ? '#374151' : '#6B7280',
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#1F2937' : '#E5E7EB',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#1F2937' : '#E5E7EB',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#00D4AA',
      downColor: '#FF444F',
      borderUpColor: '#00D4AA',
      borderDownColor: '#FF444F',
      wickUpColor: '#00D4AA',
      wickDownColor: '#FF444F',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [theme]);

  // Update data when candles change
  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const chartData: CandlestickData[] = candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles]);

  // Update with live tick
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          
          {/* Symbol Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-left">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  {selectedSymbolInfo?.display_name || selectedSymbol}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                {tick && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tick.quote.toFixed(2)}
                  </div>
                )}
              </div>
            </button>
            
            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 min-w-[200px] max-h-64 overflow-y-auto">
              {symbols.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => onSymbolChange(s.symbol)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedSymbol === s.symbol
                      ? 'text-accent font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 pulse-live" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1 min-h-[200px]" />
    </div>
  );
}

