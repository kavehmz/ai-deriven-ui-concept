export interface ComponentState {
  visible: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  order: number;
}

export interface LayoutState {
  components: Record<string, ComponentState>;
  theme: 'dark' | 'light';
  language: string;
  accentColor: string;
  healthIssues: string[];
}

export interface UIChange {
  component?: string;
  action?: 'show' | 'hide' | 'resize' | 'reorder' | 'highlight' | 'set' | 'navigate';
  value?: string;
  url?: string;  // For navigate action
  theme?: 'dark' | 'light';
  language?: string;
  accentColor?: string;
  preset?: 'trading' | 'minimal' | 'analysis' | 'monitoring';
}

export interface UserContext {
  isAuthenticated: boolean;
  accountType?: 'demo' | 'real';
  accountId?: string;
  currency?: string;
  balance?: number;
  openPositionsCount?: number;
  totalProfit?: number;
  totalInvested?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  uiChanges: UIChange[];
}

export interface Tick {
  epoch: number;
  quote: number;
  symbol: string;
}

export interface OHLC {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Position {
  contract_id: number;
  symbol: string;
  underlying: string;
  contract_type: string;
  buy_price: number;
  current_spot: number;
  profit: number;
  payout: number;
  entry_spot: number;
  is_sold: number;
  currency: string;
  longcode: string;
}

export interface Account {
  balance: number;
  currency: string;
  loginid: string;
}

export interface MarketSymbol {
  symbol: string;
  display_name: string;
  market: string;
  market_display_name: string;
}

export type ComponentId = 
  | 'chart'
  | 'orderPanel'
  | 'positions'
  | 'watchlist'
  | 'marketOverview'
  | 'news'
  | 'portfolio'
  | 'clock'
  | 'calculator';

export const COMPONENT_NAMES: Record<ComponentId, string> = {
  chart: 'Price Chart',
  orderPanel: 'Order Panel',
  positions: 'Open Positions',
  watchlist: 'Watchlist',
  marketOverview: 'Market Overview',
  news: 'News',
  portfolio: 'Portfolio',
  clock: 'World Clock',
  calculator: 'Calculator',
};

export const LANGUAGES: Record<string, { name: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', dir: 'ltr' },
  es: { name: 'Español', dir: 'ltr' },
  fr: { name: 'Français', dir: 'ltr' },
  de: { name: 'Deutsch', dir: 'ltr' },
  zh: { name: '中文', dir: 'ltr' },
  ar: { name: 'العربية', dir: 'rtl' },
  ja: { name: '日本語', dir: 'ltr' },
  pt: { name: 'Português', dir: 'ltr' },
  ru: { name: 'Русский', dir: 'ltr' },
};

export const PRESETS: Record<string, { components: Partial<Record<ComponentId, { visible: boolean; size: ComponentState['size'] }>> }> = {
  trading: {
    components: {
      chart: { visible: true, size: 'large' },
      orderPanel: { visible: true, size: 'medium' },
      positions: { visible: true, size: 'medium' },
      clock: { visible: true, size: 'small' },
      watchlist: { visible: false, size: 'small' },
      marketOverview: { visible: false, size: 'small' },
      news: { visible: false, size: 'small' },
      portfolio: { visible: false, size: 'small' },
      calculator: { visible: false, size: 'small' },
    },
  },
  minimal: {
    components: {
      chart: { visible: true, size: 'large' },
      orderPanel: { visible: true, size: 'medium' },
      positions: { visible: false, size: 'small' },
      clock: { visible: false, size: 'small' },
      watchlist: { visible: false, size: 'small' },
      marketOverview: { visible: false, size: 'small' },
      news: { visible: false, size: 'small' },
      portfolio: { visible: false, size: 'small' },
      calculator: { visible: false, size: 'small' },
    },
  },
  analysis: {
    components: {
      chart: { visible: true, size: 'large' },
      orderPanel: { visible: false, size: 'medium' },
      positions: { visible: false, size: 'small' },
      clock: { visible: false, size: 'small' },
      watchlist: { visible: true, size: 'medium' },
      marketOverview: { visible: true, size: 'medium' },
      news: { visible: true, size: 'medium' },
      portfolio: { visible: false, size: 'small' },
      calculator: { visible: false, size: 'small' },
    },
  },
  monitoring: {
    components: {
      chart: { visible: true, size: 'medium' },
      orderPanel: { visible: false, size: 'medium' },
      positions: { visible: true, size: 'large' },
      clock: { visible: false, size: 'small' },
      watchlist: { visible: false, size: 'small' },
      marketOverview: { visible: false, size: 'small' },
      news: { visible: false, size: 'small' },
      portfolio: { visible: true, size: 'medium' },
      calculator: { visible: false, size: 'small' },
    },
  },
};

