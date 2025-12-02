import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface TimeZone {
  name: string;
  city: string;
  offset: number; // Hours from UTC
  flag: string;
}

const timeZones: TimeZone[] = [
  { name: 'EST', city: 'New York', offset: -5, flag: '🇺🇸' },
  { name: 'GMT', city: 'London', offset: 0, flag: '🇬🇧' },
  { name: 'CET', city: 'Frankfurt', offset: 1, flag: '🇩🇪' },
  { name: 'JST', city: 'Tokyo', offset: 9, flag: '🇯🇵' },
  { name: 'AEST', city: 'Sydney', offset: 11, flag: '🇦🇺' },
  { name: 'SGT', city: 'Singapore', offset: 8, flag: '🇸🇬' },
];

function getTimeInTimezone(offset: number): { time: string; date: string } {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const tzDate = new Date(utc + 3600000 * offset);

  return {
    time: tzDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    date: tzDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
  };
}

function isMarketOpen(offset: number): boolean {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const tzDate = new Date(utc + 3600000 * offset);
  const hour = tzDate.getHours();
  const day = tzDate.getDay();

  // Simplified: markets open 9-17 on weekdays
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

export function WorldClock() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Globe className="w-4 h-4 text-cyan-500" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          World Clock
        </h2>
      </div>

      {/* Clocks Grid */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {timeZones.map((tz) => {
            const { time, date } = getTimeInTimezone(tz.offset);
            const open = isMarketOpen(tz.offset);

            return (
              <div
                key={tz.name}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{tz.flag}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {tz.city}
                    </span>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      open ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={open ? 'Market Open' : 'Market Closed'}
                  />
                </div>

                <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                  {time}
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {date} • {tz.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Market Open
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            Closed
          </div>
        </div>
      </div>
    </div>
  );
}

