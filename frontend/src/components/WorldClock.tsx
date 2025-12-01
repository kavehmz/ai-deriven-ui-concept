import { memo, useState, useEffect } from 'react';
import { Language, translations } from '../types';

interface WorldClockProps {
  language: Language;
}

interface CityTime {
  city: string;
  timezone: string;
  flag: string;
  market: string;
  isOpen: boolean;
}

const cities: CityTime[] = [
  { city: 'New York', timezone: 'America/New_York', flag: '🇺🇸', market: 'NYSE', isOpen: false },
  { city: 'London', timezone: 'Europe/London', flag: '🇬🇧', market: 'LSE', isOpen: false },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵', market: 'TSE', isOpen: false },
  { city: 'Sydney', timezone: 'Australia/Sydney', flag: '🇦🇺', market: 'ASX', isOpen: false },
  { city: 'Dubai', timezone: 'Asia/Dubai', flag: '🇦🇪', market: 'DFM', isOpen: false },
  { city: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', market: 'SGX', isOpen: false },
];

export const WorldClock = memo(function WorldClock({ language }: WorldClockProps) {
  const t = translations[language];
  const [times, setTimes] = useState<Record<string, { time: string; isOpen: boolean }>>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, { time: string; isOpen: boolean }> = {};
      
      cities.forEach((city) => {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        // Simple market hours check (rough approximation)
        const hour = parseInt(time.split(':')[0]);
        const isOpen = hour >= 9 && hour < 17;
        
        newTimes[city.city] = { time, isOpen };
      });
      
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.worldClock}</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-deriv-green animate-pulse" />
          <span className="text-xs text-deriv-text">Live</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="grid grid-cols-2 gap-3">
          {cities.map((city) => (
            <div 
              key={city.city}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{city.flag}</span>
                <div>
                  <div className="text-sm font-medium">{city.city}</div>
                  <div className="text-xs text-deriv-text">{city.market}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">{times[city.city]?.time || '--:--'}</div>
                <div className={`text-xs ${times[city.city]?.isOpen ? 'text-deriv-green' : 'text-deriv-text'}`}>
                  {times[city.city]?.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

