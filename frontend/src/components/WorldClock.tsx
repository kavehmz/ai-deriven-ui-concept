import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

const cities = [
  { name: 'New York', timezone: 'America/New_York', market: 'NYSE' },
  { name: 'London', timezone: 'Europe/London', market: 'LSE' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', market: 'TSE' },
  { name: 'Sydney', timezone: 'Australia/Sydney', market: 'ASX' },
];

function getTimeInTimezone(timezone: string): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function isMarketOpen(timezone: string): boolean {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: timezone, hour: 'numeric', weekday: 'short' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  
  // Simple check: markets open roughly 9-17 on weekdays
  const isWeekday = !['Sat', 'Sun'].includes(weekday);
  const isBusinessHours = hour >= 9 && hour < 17;
  
  return isWeekday && isBusinessHours;
}

export function WorldClock({ language, primaryColor }: Props) {
  const [times, setTimes] = useState<Record<string, string>>({});
  const t = translations[language] || translations.en;

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      cities.forEach(city => {
        newTimes[city.timezone] = getTimeInTimezone(city.timezone);
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5" style={{ color: primaryColor }} />
        <h2 className="text-lg font-semibold">{t.clock}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cities.map((city, index) => {
          const isOpen = isMarketOpen(city.timezone);
          return (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl bg-white/5 dark:bg-black/20"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{city.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isOpen 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {city.market}
                </span>
              </div>
              <div className="font-mono text-2xl font-bold" style={{ color: primaryColor }}>
                {times[city.timezone] || '--:--:--'}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

