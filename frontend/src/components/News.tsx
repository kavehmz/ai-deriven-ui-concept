import { memo } from 'react';
import { Language, translations } from '../types';

interface NewsProps {
  language: Language;
}

// Mock news items
const mockNews = [
  {
    id: 1,
    title: 'Volatility indices show strong momentum in Q4',
    time: '2 hours ago',
    source: 'Deriv News',
    category: 'Markets'
  },
  {
    id: 2,
    title: 'New trading features added to Deriv Trader',
    time: '5 hours ago',
    source: 'Deriv Blog',
    category: 'Platform'
  },
  {
    id: 3,
    title: 'Understanding multipliers: A complete guide',
    time: '1 day ago',
    source: 'Academy',
    category: 'Education'
  },
  {
    id: 4,
    title: 'Weekly market analysis: Synthetic indices performance',
    time: '2 days ago',
    source: 'Research',
    category: 'Analysis'
  }
];

export const News = memo(function News({ language }: NewsProps) {
  const t = translations[language];

  return (
    <div className="h-full flex flex-col">
      <div className="card-header">
        <span>{t.news}</span>
        <button className="text-xs accent-text hover:underline">View all</button>
      </div>
      
      <div className="card-content space-y-3">
        {mockNews.map((item) => (
          <article 
            key={item.id}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-deriv-text">
                {item.category}
              </span>
              <span className="text-xs text-deriv-text">{item.time}</span>
            </div>
            <h3 className="text-sm font-medium leading-snug mb-1">
              {item.title}
            </h3>
            <div className="text-xs text-deriv-text">{item.source}</div>
          </article>
        ))}
      </div>
    </div>
  );
});

