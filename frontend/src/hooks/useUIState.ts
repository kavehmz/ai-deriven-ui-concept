import { useState, useCallback, useEffect } from 'react';
import { UIState, ComponentsConfig, ComponentConfig, ComponentSize, Language, UIChanges } from '../types';

const STORAGE_KEY = 'amy-ui-state';

// Default component configurations
const defaultComponents: ComponentsConfig = {
  chart: { visible: true, size: 'large', order: 2 },
  positions: { visible: true, size: 'medium', order: 0 },
  watchlist: { visible: true, size: 'medium', order: 1 },
  orderPanel: { visible: true, size: 'medium', order: 3 },
  marketOverview: { visible: true, size: 'small', order: 4 },
  news: { visible: true, size: 'small', order: 6 },
  portfolio: { visible: true, size: 'small', order: 5 },
  clock: { visible: true, size: 'small', order: 7 },
  calculator: { visible: false, size: 'small', order: 8 },
};

// Layout presets
const layoutPresets: Record<string, Partial<ComponentsConfig>> = {
  default: defaultComponents,
  trading: {
    chart: { visible: true, size: 'large', order: 0 },
    positions: { visible: true, size: 'medium', order: 1 },
    orderPanel: { visible: true, size: 'medium', order: 2 },
    watchlist: { visible: true, size: 'small', order: 3 },
    marketOverview: { visible: true, size: 'small', order: 4 },
    portfolio: { visible: false, size: 'small', order: 5 },
    news: { visible: false, size: 'small', order: 6 },
    clock: { visible: true, size: 'small', order: 7 },
    calculator: { visible: true, size: 'small', order: 8 },
  },
  minimal: {
    chart: { visible: true, size: 'full', order: 0 },
    positions: { visible: false, size: 'medium', order: 1 },
    orderPanel: { visible: true, size: 'medium', order: 2 },
    watchlist: { visible: false, size: 'small', order: 3 },
    marketOverview: { visible: false, size: 'small', order: 4 },
    portfolio: { visible: true, size: 'small', order: 5 },
    news: { visible: false, size: 'small', order: 6 },
    clock: { visible: false, size: 'small', order: 7 },
    calculator: { visible: false, size: 'small', order: 8 },
  },
  analysis: {
    chart: { visible: true, size: 'large', order: 0 },
    positions: { visible: true, size: 'small', order: 3 },
    watchlist: { visible: true, size: 'medium', order: 1 },
    orderPanel: { visible: false, size: 'small', order: 7 },
    marketOverview: { visible: true, size: 'medium', order: 2 },
    portfolio: { visible: true, size: 'small', order: 4 },
    news: { visible: true, size: 'medium', order: 5 },
    clock: { visible: true, size: 'small', order: 6 },
    calculator: { visible: true, size: 'small', order: 8 },
  },
  monitoring: {
    chart: { visible: true, size: 'medium', order: 0 },
    positions: { visible: true, size: 'large', order: 1 },
    watchlist: { visible: true, size: 'medium', order: 2 },
    orderPanel: { visible: false, size: 'small', order: 7 },
    marketOverview: { visible: true, size: 'medium', order: 3 },
    portfolio: { visible: true, size: 'medium', order: 4 },
    news: { visible: true, size: 'small', order: 5 },
    clock: { visible: true, size: 'small', order: 6 },
    calculator: { visible: false, size: 'small', order: 8 },
  },
};

const defaultUIState: UIState = {
  components: defaultComponents,
  theme: 'dark',
  language: 'en',
  accentColor: '#ff444f',
};

export interface UseUIStateReturn {
  uiState: UIState;
  setComponentVisibility: (key: keyof ComponentsConfig, visible: boolean) => void;
  setComponentSize: (key: keyof ComponentsConfig, size: ComponentSize) => void;
  setComponentOrder: (key: keyof ComponentsConfig, order: number) => void;
  moveComponent: (key: keyof ComponentsConfig, direction: 'left' | 'right' | 'up' | 'down') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: Language) => void;
  setAccentColor: (color: string) => void;
  applyUIChanges: (changes: UIChanges) => void;
  applyLayoutPreset: (preset: string) => void;
  resetUI: () => void;
  getVisibleComponentsSorted: () => { key: keyof ComponentsConfig; config: ComponentConfig }[];
  getLayoutDescription: () => string;
}

export function useUIState(): UseUIStateReturn {
  const [uiState, setUIState] = useState<UIState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new components
        const mergedComponents = { ...defaultComponents };
        if (parsed.components) {
          for (const key of Object.keys(defaultComponents) as (keyof ComponentsConfig)[]) {
            if (parsed.components[key]) {
              mergedComponents[key] = {
                ...defaultComponents[key],
                ...parsed.components[key]
              };
            }
          }
        }
        return {
          ...defaultUIState,
          ...parsed,
          components: mergedComponents
        };
      }
    } catch (e) {
      console.error('Failed to load UI state:', e);
    }
    return defaultUIState;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uiState));
  }, [uiState]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(uiState.theme);
    document.documentElement.dir = uiState.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = uiState.language;
  }, [uiState.theme, uiState.language]);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', uiState.accentColor);
    const hex = uiState.accentColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 20);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 20);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 20);
    const hoverColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    document.documentElement.style.setProperty('--accent-hover', hoverColor);
    document.documentElement.style.setProperty('--accent-glow', `${uiState.accentColor}4d`);
  }, [uiState.accentColor]);

  const setComponentVisibility = useCallback((key: keyof ComponentsConfig, visible: boolean) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: { ...prev.components[key], visible }
      }
    }));
  }, []);

  const setComponentSize = useCallback((key: keyof ComponentsConfig, size: ComponentSize) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: { ...prev.components[key], size }
      }
    }));
  }, []);

  const setComponentOrder = useCallback((key: keyof ComponentsConfig, order: number) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: { ...prev.components[key], order }
      }
    }));
  }, []);

  const moveComponent = useCallback((key: keyof ComponentsConfig, direction: 'left' | 'right' | 'up' | 'down') => {
    setUIState(prev => {
      const currentOrder = prev.components[key].order;
      const components = { ...prev.components };
      
      // Get sorted visible components
      const sorted = Object.entries(components)
        .filter(([, config]) => config.visible)
        .sort((a, b) => a[1].order - b[1].order);
      
      const currentIndex = sorted.findIndex(([k]) => k === key);
      if (currentIndex === -1) return prev;
      
      let targetIndex: number;
      if (direction === 'left' || direction === 'up') {
        targetIndex = Math.max(0, currentIndex - 1);
      } else {
        targetIndex = Math.min(sorted.length - 1, currentIndex + 1);
      }
      
      if (targetIndex === currentIndex) return prev;
      
      // Swap orders
      const targetKey = sorted[targetIndex][0] as keyof ComponentsConfig;
      const targetOrder = components[targetKey].order;
      
      components[key] = { ...components[key], order: targetOrder };
      components[targetKey] = { ...components[targetKey], order: currentOrder };
      
      return { ...prev, components };
    });
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    setUIState(prev => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setUIState(prev => ({ ...prev, language }));
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setUIState(prev => ({ ...prev, accentColor: color }));
  }, []);

  const applyLayoutPreset = useCallback((preset: string) => {
    const presetConfig = layoutPresets[preset];
    if (presetConfig) {
      setUIState(prev => ({
        ...prev,
        components: {
          ...prev.components,
          ...presetConfig
        } as ComponentsConfig
      }));
    }
  }, []);

  const applyUIChanges = useCallback((changes: UIChanges) => {
    setUIState(prev => {
      const newState = { ...prev };
      
      // Apply layout preset first if specified
      if (changes.layout && layoutPresets[changes.layout]) {
        newState.components = {
          ...prev.components,
          ...layoutPresets[changes.layout]
        } as ComponentsConfig;
      }
      
      // Apply individual component changes
      if (changes.components) {
        const updatedComponents = { ...newState.components };
        
        for (const [key, value] of Object.entries(changes.components)) {
          const componentKey = key as keyof ComponentsConfig;
          if (typeof value === 'boolean') {
            // Simple visibility toggle
            updatedComponents[componentKey] = {
              ...updatedComponents[componentKey],
              visible: value
            };
          } else if (value && typeof value === 'object') {
            // Full config update
            updatedComponents[componentKey] = {
              ...updatedComponents[componentKey],
              ...value
            };
          }
        }
        
        newState.components = updatedComponents;
      }
      
      if (changes.theme) newState.theme = changes.theme;
      if (changes.language) newState.language = changes.language;
      if (changes.accentColor) newState.accentColor = changes.accentColor;
      
      return newState;
    });
  }, []);

  const resetUI = useCallback(() => {
    setUIState(defaultUIState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getVisibleComponentsSorted = useCallback(() => {
    return Object.entries(uiState.components)
      .filter(([, config]) => config.visible)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([key, config]) => ({ key: key as keyof ComponentsConfig, config }));
  }, [uiState.components]);

  // Generate human-readable layout description for AI context
  const getLayoutDescription = useCallback(() => {
    const sorted = getVisibleComponentsSorted();
    const sizeNames: Record<ComponentSize, string> = {
      small: 'small (1/4 width)',
      medium: 'medium (1/2 width)', 
      large: 'large (3/4 width)',
      full: 'full width'
    };
    
    const componentNames: Record<string, string> = {
      chart: 'Price Chart',
      positions: 'Open Positions',
      watchlist: 'Watchlist',
      orderPanel: 'Order Panel',
      marketOverview: 'Market Overview',
      news: 'News Feed',
      portfolio: 'Portfolio',
      clock: 'World Clock',
      calculator: 'Calculator'
    };
    
    const visible = sorted.map(({ key, config }) => 
      `${componentNames[key as string]} (${sizeNames[config.size as ComponentSize]})`
    ).join(', ');
    
    const hidden = Object.entries(uiState.components)
      .filter(([, config]) => !config.visible)
      .map(([key]) => componentNames[key as string])
      .join(', ');
    
    return `Visible components (in order): ${visible || 'none'}. Hidden: ${hidden || 'none'}. Theme: ${uiState.theme}. Language: ${uiState.language}.`;
  }, [uiState, getVisibleComponentsSorted]);

  return {
    uiState,
    setComponentVisibility,
    setComponentSize,
    setComponentOrder,
    moveComponent,
    setTheme,
    setLanguage,
    setAccentColor,
    applyUIChanges,
    applyLayoutPreset,
    resetUI,
    getVisibleComponentsSorted,
    getLayoutDescription
  };
}
