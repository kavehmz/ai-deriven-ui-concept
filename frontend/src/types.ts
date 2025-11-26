export interface UIState {
  theme: 'dark' | 'light';
  language: string;
  visibleComponents: string[];
  layout: 'standard' | 'compact' | 'expanded';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface UIUpdate {
  theme?: 'dark' | 'light' | null;
  language?: string | null;
  showComponents?: string[] | null;
  hideComponents?: string[] | null;
  layout?: 'standard' | 'compact' | 'expanded' | null;
  primaryColor?: string | null;
  fontSize?: 'small' | 'medium' | 'large' | null;
  reasoning?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  uiUpdate?: UIUpdate | null;
  shouldUpdateUI: boolean;
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const translations: Record<string, Record<string, string>> = {
  en: {
    watchlist: 'Watchlist',
    portfolio: 'Portfolio',
    chart: 'Price Chart',
    orderPanel: 'Quick Trade',
    news: 'Market News',
    marketOverview: 'Market Overview',
    clock: 'World Clock',
    calculator: 'Position Calculator',
    typeMessage: 'Type a message to Amy...',
    send: 'Send',
    price: 'Price',
    change: 'Change',
    volume: 'Volume',
    symbol: 'Symbol',
    quantity: 'Qty',
    avgPrice: 'Avg Price',
    pnl: 'P&L',
    buy: 'Buy',
    sell: 'Sell',
    amount: 'Amount',
    total: 'Total',
    welcomeMessage: "Hi! I'm Amy, your AI trading assistant. I can customize this interface based on your preferences. Try asking me to change the theme, show different components, or switch languages!",
  },
  es: {
    watchlist: 'Lista de Seguimiento',
    portfolio: 'Portafolio',
    chart: 'Gráfico de Precios',
    orderPanel: 'Orden Rápida',
    news: 'Noticias del Mercado',
    marketOverview: 'Resumen del Mercado',
    clock: 'Reloj Mundial',
    calculator: 'Calculadora de Posición',
    typeMessage: 'Escribe un mensaje a Amy...',
    send: 'Enviar',
    price: 'Precio',
    change: 'Cambio',
    volume: 'Volumen',
    symbol: 'Símbolo',
    quantity: 'Cantidad',
    avgPrice: 'Precio Promedio',
    pnl: 'Ganancia/Pérdida',
    buy: 'Comprar',
    sell: 'Vender',
    amount: 'Cantidad',
    total: 'Total',
    welcomeMessage: '¡Hola! Soy Amy, tu asistente de trading con IA. Puedo personalizar esta interfaz según tus preferencias. ¡Prueba a pedirme que cambie el tema, muestre diferentes componentes o cambie de idioma!',
  },
  fr: {
    watchlist: 'Liste de Surveillance',
    portfolio: 'Portefeuille',
    chart: 'Graphique des Prix',
    orderPanel: 'Ordre Rapide',
    news: 'Actualités du Marché',
    marketOverview: 'Aperçu du Marché',
    clock: 'Horloge Mondiale',
    calculator: 'Calculateur de Position',
    typeMessage: 'Écrivez un message à Amy...',
    send: 'Envoyer',
    price: 'Prix',
    change: 'Variation',
    volume: 'Volume',
    symbol: 'Symbole',
    quantity: 'Qté',
    avgPrice: 'Prix Moyen',
    pnl: 'P&L',
    buy: 'Acheter',
    sell: 'Vendre',
    amount: 'Montant',
    total: 'Total',
    welcomeMessage: "Bonjour! Je suis Amy, votre assistant de trading IA. Je peux personnaliser cette interface selon vos préférences. Essayez de me demander de changer le thème, d'afficher différents composants ou de changer de langue!",
  },
  de: {
    watchlist: 'Beobachtungsliste',
    portfolio: 'Portfolio',
    chart: 'Preischart',
    orderPanel: 'Schnellhandel',
    news: 'Marktnachrichten',
    marketOverview: 'Marktübersicht',
    clock: 'Weltzeit',
    calculator: 'Positionsrechner',
    typeMessage: 'Nachricht an Amy schreiben...',
    send: 'Senden',
    price: 'Preis',
    change: 'Änderung',
    volume: 'Volumen',
    symbol: 'Symbol',
    quantity: 'Menge',
    avgPrice: 'Durchschnittspreis',
    pnl: 'Gewinn/Verlust',
    buy: 'Kaufen',
    sell: 'Verkaufen',
    amount: 'Betrag',
    total: 'Gesamt',
    welcomeMessage: 'Hallo! Ich bin Amy, Ihr KI-Handelsassistent. Ich kann diese Oberfläche nach Ihren Wünschen anpassen. Bitten Sie mich, das Thema zu ändern, verschiedene Komponenten anzuzeigen oder die Sprache zu wechseln!',
  },
  zh: {
    watchlist: '自选列表',
    portfolio: '投资组合',
    chart: '价格图表',
    orderPanel: '快速交易',
    news: '市场新闻',
    marketOverview: '市场概览',
    clock: '世界时钟',
    calculator: '仓位计算器',
    typeMessage: '给Amy发送消息...',
    send: '发送',
    price: '价格',
    change: '涨跌',
    volume: '成交量',
    symbol: '代码',
    quantity: '数量',
    avgPrice: '均价',
    pnl: '盈亏',
    buy: '买入',
    sell: '卖出',
    amount: '金额',
    total: '总计',
    welcomeMessage: '你好！我是Amy，你的AI交易助手。我可以根据你的喜好定制这个界面。试着让我改变主题、显示不同的组件或切换语言！',
  },
  ar: {
    watchlist: 'قائمة المراقبة',
    portfolio: 'المحفظة',
    chart: 'مخطط الأسعار',
    orderPanel: 'تداول سريع',
    news: 'أخبار السوق',
    marketOverview: 'نظرة عامة على السوق',
    clock: 'الساعة العالمية',
    calculator: 'حاسبة المركز',
    typeMessage: 'اكتب رسالة إلى Amy...',
    send: 'إرسال',
    price: 'السعر',
    change: 'التغيير',
    volume: 'الحجم',
    symbol: 'الرمز',
    quantity: 'الكمية',
    avgPrice: 'متوسط السعر',
    pnl: 'الربح/الخسارة',
    buy: 'شراء',
    sell: 'بيع',
    amount: 'المبلغ',
    total: 'المجموع',
    welcomeMessage: 'مرحبًا! أنا Amy، مساعد التداول الذكي الخاص بك. يمكنني تخصيص هذه الواجهة وفقًا لتفضيلاتك. جرب أن تطلب مني تغيير السمة أو عرض مكونات مختلفة أو تبديل اللغات!',
  },
};

