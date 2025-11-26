import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

// Generate initial chart data
function generateChartData(days: number) {
  const data = [];
  let price = 43000;
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    price = price + (Math.random() - 0.48) * 500;
    data.push({
      time: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 1000000000),
    });
  }
  
  return data;
}

export function PriceChart({ language, primaryColor }: Props) {
  const [chartData, setChartData] = useState(() => generateChartData(30));
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const t = translations[language] || translations.en;

  const periods = ['1D', '1W', '1M', '3M', '1Y'];

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev];
        const lastPrice = newData[newData.length - 1].price;
        newData[newData.length - 1] = {
          ...newData[newData.length - 1],
          price: lastPrice + (Math.random() - 0.5) * 100,
        };
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const startPrice = chartData[0]?.price || 0;
  const priceChange = currentPrice - startPrice;
  const priceChangePercent = (priceChange / startPrice) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: primaryColor }} />
          <h2 className="text-lg font-semibold">{t.chart}</h2>
        </div>
        <div className="flex gap-1">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/10'
              }`}
              style={selectedPeriod === period ? { backgroundColor: primaryColor } : {}}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Price Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono">BTC/USD</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-mono">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`font-mono ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              width={60}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={primaryColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

