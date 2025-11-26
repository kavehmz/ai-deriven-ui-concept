import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NewsItem, translations } from '../types';

interface Props {
  language: string;
  primaryColor: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin Surges Past $43K as Institutional Interest Grows',
    source: 'CryptoNews',
    time: '2m ago',
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
    source: 'Bloomberg',
    time: '15m ago',
    sentiment: 'positive',
  },
  {
    id: '3',
    title: 'Ethereum Network Upgrade Scheduled for Next Month',
    source: 'CoinDesk',
    time: '32m ago',
    sentiment: 'neutral',
  },
  {
    id: '4',
    title: 'Major Exchange Reports Security Vulnerability',
    source: 'Reuters',
    time: '1h ago',
    sentiment: 'negative',
  },
  {
    id: '5',
    title: 'Apple Announces Record Q4 Earnings',
    source: 'CNBC',
    time: '2h ago',
    sentiment: 'positive',
  },
];

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'negative':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
};

export function News({ language, primaryColor }: Props) {
  const t = translations[language] || translations.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5" style={{ color: primaryColor }} />
        <h2 className="text-lg font-semibold">{t.news}</h2>
      </div>

      <div className="space-y-3">
        {newsData.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl hover:bg-white/10 dark:hover:bg-black/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <SentimentIcon sentiment={news.sentiment} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {news.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

