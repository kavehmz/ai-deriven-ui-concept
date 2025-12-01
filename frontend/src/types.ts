// Component size options
export type ComponentSize = 'small' | 'medium' | 'large' | 'full';

// Individual component configuration
export interface ComponentConfig {
  visible: boolean;
  size: ComponentSize;
  order: number; // Lower numbers appear first
}

// All component configurations
export interface ComponentsConfig {
  chart: ComponentConfig;
  positions: ComponentConfig;
  watchlist: ComponentConfig;
  orderPanel: ComponentConfig;
  marketOverview: ComponentConfig;
  news: ComponentConfig;
  portfolio: ComponentConfig;
  clock: ComponentConfig;
  calculator: ComponentConfig;
}

// Legacy visibility type for backwards compatibility
export interface ComponentVisibility {
  chart: boolean;
  positions: boolean;
  watchlist: boolean;
  orderPanel: boolean;
  marketOverview: boolean;
  news: boolean;
  portfolio: boolean;
  clock: boolean;
  calculator: boolean;
}

// UI State managed by AI
export interface UIState {
  components: ComponentsConfig;
  theme: 'dark' | 'light';
  language: Language;
  accentColor: string;
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'ja' | 'pt' | 'ru';

// UI Changes from AI - supports both simple visibility and full config
export interface UIChanges {
  components?: Partial<{
    [K in keyof ComponentsConfig]: Partial<ComponentConfig> | boolean;
  }>;
  theme?: 'dark' | 'light';
  language?: Language;
  accentColor?: string;
  // Layout presets
  layout?: 'default' | 'trading' | 'minimal' | 'analysis' | 'monitoring';
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  uiChanges?: UIChanges;
}

// Deriv API types
export interface DerivTick {
  symbol: string;
  quote: number;
  epoch: number;
}

export interface DerivCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface DerivPosition {
  contract_id: string;
  symbol: string;
  contract_type: string;
  buy_price: number;
  current_price: number;
  pnl: number;
  pnl_percentage: number;
}

export interface DerivBalance {
  balance: number;
  currency: string;
  loginid: string;
  account_type: string;
}

export interface MarketInfo {
  symbol: string;
  display_name: string;
  market: string;
  submarket: string;
  pip: number;
  quote: number;
  change: number;
  change_percent: number;
}

// Translations
export const translations: Record<Language, Record<string, string>> = {
  en: {
    openPositions: 'Open Positions',
    portfolio: 'Portfolio',
    watchlist: 'Watchlist',
    marketOverview: 'Market Overview',
    news: 'News',
    calculator: 'Calculator',
    worldClock: 'World Clock',
    buy: 'Buy',
    sell: 'Sell',
    stake: 'Stake',
    payout: 'Payout',
    profit: 'Profit',
    loss: 'Loss',
    balance: 'Balance',
    chatPlaceholder: 'Ask Amy to customize your trading view...',
    send: 'Send',
    totalPnL: 'Total P/L',
    close: 'Close',
    noPositions: 'No open positions',
    loading: 'Loading...',
  },
  es: {
    openPositions: 'Posiciones Abiertas',
    portfolio: 'Portafolio',
    watchlist: 'Lista de Seguimiento',
    marketOverview: 'Resumen del Mercado',
    news: 'Noticias',
    calculator: 'Calculadora',
    worldClock: 'Reloj Mundial',
    buy: 'Comprar',
    sell: 'Vender',
    stake: 'Apuesta',
    payout: 'Pago',
    profit: 'Ganancia',
    loss: 'Pérdida',
    balance: 'Saldo',
    chatPlaceholder: 'Pide a Amy que personalice tu vista...',
    send: 'Enviar',
    totalPnL: 'G/P Total',
    close: 'Cerrar',
    noPositions: 'Sin posiciones abiertas',
    loading: 'Cargando...',
  },
  fr: {
    openPositions: 'Positions Ouvertes',
    portfolio: 'Portefeuille',
    watchlist: 'Liste de Suivi',
    marketOverview: 'Aperçu du Marché',
    news: 'Actualités',
    calculator: 'Calculatrice',
    worldClock: 'Horloge Mondiale',
    buy: 'Acheter',
    sell: 'Vendre',
    stake: 'Mise',
    payout: 'Paiement',
    profit: 'Profit',
    loss: 'Perte',
    balance: 'Solde',
    chatPlaceholder: 'Demandez à Amy de personnaliser votre vue...',
    send: 'Envoyer',
    totalPnL: 'P/P Total',
    close: 'Fermer',
    noPositions: 'Aucune position ouverte',
    loading: 'Chargement...',
  },
  de: {
    openPositions: 'Offene Positionen',
    portfolio: 'Portfolio',
    watchlist: 'Beobachtungsliste',
    marketOverview: 'Marktübersicht',
    news: 'Nachrichten',
    calculator: 'Rechner',
    worldClock: 'Weltzeituhr',
    buy: 'Kaufen',
    sell: 'Verkaufen',
    stake: 'Einsatz',
    payout: 'Auszahlung',
    profit: 'Gewinn',
    loss: 'Verlust',
    balance: 'Guthaben',
    chatPlaceholder: 'Fragen Sie Amy, Ihre Ansicht anzupassen...',
    send: 'Senden',
    totalPnL: 'Gesamt G/V',
    close: 'Schließen',
    noPositions: 'Keine offenen Positionen',
    loading: 'Laden...',
  },
  zh: {
    openPositions: '持仓',
    portfolio: '投资组合',
    watchlist: '自选列表',
    marketOverview: '市场概览',
    news: '新闻',
    calculator: '计算器',
    worldClock: '世界时钟',
    buy: '买入',
    sell: '卖出',
    stake: '投注',
    payout: '派息',
    profit: '盈利',
    loss: '亏损',
    balance: '余额',
    chatPlaceholder: '让Amy帮您定制交易界面...',
    send: '发送',
    totalPnL: '总盈亏',
    close: '关闭',
    noPositions: '暂无持仓',
    loading: '加载中...',
  },
  ar: {
    openPositions: 'المراكز المفتوحة',
    portfolio: 'المحفظة',
    watchlist: 'قائمة المراقبة',
    marketOverview: 'نظرة عامة على السوق',
    news: 'الأخبار',
    calculator: 'الآلة الحاسبة',
    worldClock: 'الساعة العالمية',
    buy: 'شراء',
    sell: 'بيع',
    stake: 'المبلغ',
    payout: 'الدفع',
    profit: 'ربح',
    loss: 'خسارة',
    balance: 'الرصيد',
    chatPlaceholder: 'اطلب من إيمي تخصيص واجهتك...',
    send: 'إرسال',
    totalPnL: 'إجمالي الربح/الخسارة',
    close: 'إغلاق',
    noPositions: 'لا توجد مراكز مفتوحة',
    loading: 'جار التحميل...',
  },
  ja: {
    openPositions: 'オープンポジション',
    portfolio: 'ポートフォリオ',
    watchlist: 'ウォッチリスト',
    marketOverview: 'マーケット概要',
    news: 'ニュース',
    calculator: '計算機',
    worldClock: '世界時計',
    buy: '買い',
    sell: '売り',
    stake: 'ステーク',
    payout: 'ペイアウト',
    profit: '利益',
    loss: '損失',
    balance: '残高',
    chatPlaceholder: 'Amyに画面をカスタマイズしてもらう...',
    send: '送信',
    totalPnL: '合計損益',
    close: '閉じる',
    noPositions: 'ポジションなし',
    loading: '読み込み中...',
  },
  pt: {
    openPositions: 'Posições Abertas',
    portfolio: 'Portfólio',
    watchlist: 'Lista de Observação',
    marketOverview: 'Visão do Mercado',
    news: 'Notícias',
    calculator: 'Calculadora',
    worldClock: 'Relógio Mundial',
    buy: 'Comprar',
    sell: 'Vender',
    stake: 'Aposta',
    payout: 'Pagamento',
    profit: 'Lucro',
    loss: 'Perda',
    balance: 'Saldo',
    chatPlaceholder: 'Peça à Amy para personalizar sua visualização...',
    send: 'Enviar',
    totalPnL: 'L/P Total',
    close: 'Fechar',
    noPositions: 'Sem posições abertas',
    loading: 'Carregando...',
  },
  ru: {
    openPositions: 'Открытые позиции',
    portfolio: 'Портфель',
    watchlist: 'Список наблюдения',
    marketOverview: 'Обзор рынка',
    news: 'Новости',
    calculator: 'Калькулятор',
    worldClock: 'Мировые часы',
    buy: 'Купить',
    sell: 'Продать',
    stake: 'Ставка',
    payout: 'Выплата',
    profit: 'Прибыль',
    loss: 'Убыток',
    balance: 'Баланс',
    chatPlaceholder: 'Попросите Amy настроить ваш вид...',
    send: 'Отправить',
    totalPnL: 'Общий P/L',
    close: 'Закрыть',
    noPositions: 'Нет открытых позиций',
    loading: 'Загрузка...',
  },
};

