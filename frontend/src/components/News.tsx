import { Newspaper, ExternalLink, Clock } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: 'market' | 'analysis' | 'alert';
}

const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Volatility Indices See Increased Activity',
    summary: 'Trading volumes on synthetic indices have risen 15% this week as traders seek opportunities in volatile market conditions.',
    source: 'Deriv Insights',
    time: '2 hours ago',
    category: 'market',
  },
  {
    id: '2',
    title: 'New Trading Features Released',
    summary: 'Deriv introduces enhanced charting tools and new order types for more precise trade execution.',
    source: 'Deriv Blog',
    time: '5 hours ago',
    category: 'alert',
  },
  {
    id: '3',
    title: 'Weekly Market Analysis',
    summary: 'Our analysts review key patterns in the Volatility 100 Index and provide outlook for the coming week.',
    source: 'Market Analysis',
    time: '1 day ago',
    category: 'analysis',
  },
  {
    id: '4',
    title: 'Understanding Rise/Fall Contracts',
    summary: 'A comprehensive guide to trading Rise/Fall contracts effectively on synthetic indices.',
    source: 'Trading Academy',
    time: '2 days ago',
    category: 'analysis',
  },
];

const categoryColors = {
  market: 'bg-blue-500/10 text-blue-500',
  analysis: 'bg-purple-500/10 text-purple-500',
  alert: 'bg-orange-500/10 text-orange-500',
};

export function News() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Newspaper className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Market News
        </h2>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {newsItems.map((item) => (
            <article
              key={item.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    categoryColors[item.category]
                  }`}
                >
                  {item.category}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                {item.summary}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>{item.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

