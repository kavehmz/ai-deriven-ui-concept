import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutState, ComponentState, UIChange, ComponentId, PRESETS, LANGUAGES } from '../types';

const STORAGE_KEY = 'amy-ui-state';
const HIGHLIGHT_DURATION = 3000; // 3 seconds

const DEFAULT_LAYOUT: LayoutState = {
  components: {
    chart: { visible: true, size: 'large', order: 0 },
    orderPanel: { visible: true, size: 'medium', order: 1 },
    positions: { visible: true, size: 'medium', order: 2 },
    watchlist: { visible: true, size: 'small', order: 3 },
    marketOverview: { visible: false, size: 'small', order: 4 },
    news: { visible: false, size: 'small', order: 5 },
    portfolio: { visible: true, size: 'small', order: 6 },
    clock: { visible: true, size: 'small', order: 7 },
    calculator: { visible: false, size: 'small', order: 8 },
  },
  theme: 'dark',
  language: 'en',
  accentColor: '#FF444F',
  healthIssues: [],
};

export function useUIState() {
  const [highlightedComponents, setHighlightedComponents] = useState<Set<ComponentId>>(new Set());
  const highlightTimersRef = useRef<Map<ComponentId, ReturnType<typeof setTimeout>>>(new Map());

  const [layout, setLayout] = useState<LayoutState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new components
        return {
          ...DEFAULT_LAYOUT,
          ...parsed,
          components: {
            ...DEFAULT_LAYOUT.components,
            ...parsed.components,
          },
        };
      }
    } catch (e) {
      console.error('Failed to load layout state:', e);
    }
    return DEFAULT_LAYOUT;
  });

  // Save to localStorage whenever layout changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (e) {
      console.error('Failed to save layout state:', e);
    }
  }, [layout]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', layout.theme === 'dark');
  }, [layout.theme]);

  // Apply language direction
  useEffect(() => {
    const langConfig = LANGUAGES[layout.language];
    if (langConfig) {
      document.documentElement.dir = langConfig.dir;
      document.documentElement.lang = layout.language;
    }
  }, [layout.language]);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', layout.accentColor);
    // Calculate hover color (slightly darker)
    const r = parseInt(layout.accentColor.slice(1, 3), 16);
    const g = parseInt(layout.accentColor.slice(3, 5), 16);
    const b = parseInt(layout.accentColor.slice(5, 7), 16);
    const hoverColor = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
    document.documentElement.style.setProperty('--accent-hover', hoverColor);
  }, [layout.accentColor]);

  const highlightComponent = useCallback((componentId: ComponentId) => {
    // Clear existing timer for this component
    const existingTimer = highlightTimersRef.current.get(componentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add to highlighted set
    setHighlightedComponents((prev) => new Set(prev).add(componentId));

    // Set timer to remove highlight
    const timer = setTimeout(() => {
      setHighlightedComponents((prev) => {
        const next = new Set(prev);
        next.delete(componentId);
        return next;
      });
      highlightTimersRef.current.delete(componentId);
    }, HIGHLIGHT_DURATION);

    highlightTimersRef.current.set(componentId, timer);
  }, []);

  const applyUIChanges = useCallback((changes: UIChange[]) => {
    // Process highlight actions separately (they don't modify layout state)
    for (const change of changes) {
      if (change.action === 'highlight' && change.component) {
        highlightComponent(change.component as ComponentId);
      }
    }

    setLayout((prev) => {
      let newLayout = { ...prev };
      
      for (const change of changes) {
        // Skip highlight actions (handled above)
        if (change.action === 'highlight') continue;

        // Apply preset
        if (change.preset && PRESETS[change.preset]) {
          const preset = PRESETS[change.preset];
          const newComponents = { ...newLayout.components };
          
          for (const [compId, settings] of Object.entries(preset.components)) {
            if (newComponents[compId]) {
              newComponents[compId] = {
                ...newComponents[compId],
                visible: settings.visible,
                size: settings.size,
              };
            }
          }
          
          newLayout = { ...newLayout, components: newComponents };
          continue;
        }

        // Apply theme change
        if (change.theme) {
          newLayout = { ...newLayout, theme: change.theme };
        }

        // Apply language change
        if (change.language) {
          newLayout = { ...newLayout, language: change.language };
        }

        // Apply accent color change
        if (change.accentColor) {
          newLayout = { ...newLayout, accentColor: change.accentColor };
        }

        // Apply component-specific changes
        if (change.component && newLayout.components[change.component]) {
          const comp = newLayout.components[change.component];
          
          switch (change.action) {
            case 'show':
              newLayout = {
                ...newLayout,
                components: {
                  ...newLayout.components,
                  [change.component]: { ...comp, visible: true },
                },
              };
              break;
            case 'hide':
              newLayout = {
                ...newLayout,
                components: {
                  ...newLayout.components,
                  [change.component]: { ...comp, visible: false },
                },
              };
              break;
            case 'resize':
              if (change.value && ['small', 'medium', 'large', 'full'].includes(change.value)) {
                newLayout = {
                  ...newLayout,
                  components: {
                    ...newLayout.components,
                    [change.component]: { 
                      ...comp, 
                      size: change.value as ComponentState['size'],
                    },
                  },
                };
              }
              break;
            case 'reorder':
              if (change.value) {
                const newOrder = parseInt(change.value);
                if (!isNaN(newOrder)) {
                  newLayout = {
                    ...newLayout,
                    components: {
                      ...newLayout.components,
                      [change.component]: { ...comp, order: newOrder },
                    },
                  };
                }
              }
              break;
          }
        }
      }

      return newLayout;
    });
  }, [highlightComponent]);

  const toggleComponent = useCallback((componentId: ComponentId) => {
    setLayout((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [componentId]: {
          ...prev.components[componentId],
          visible: !prev.components[componentId].visible,
        },
      },
    }));
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    setLayout((prev) => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: string) => {
    setLayout((prev) => ({ ...prev, language }));
  }, []);

  const setAccentColor = useCallback((accentColor: string) => {
    setLayout((prev) => ({ ...prev, accentColor }));
  }, []);

  const reportHealthIssue = useCallback((issue: string) => {
    setLayout((prev) => {
      if (prev.healthIssues.includes(issue)) return prev;
      return { ...prev, healthIssues: [...prev.healthIssues, issue] };
    });
  }, []);

  const clearHealthIssues = useCallback(() => {
    setLayout((prev) => ({ ...prev, healthIssues: [] }));
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
  }, []);

  // Get visible components sorted by order
  const visibleComponents = Object.entries(layout.components)
    .filter(([, state]) => state.visible)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id]) => id as ComponentId);

  return {
    layout,
    visibleComponents,
    highlightedComponents,
    applyUIChanges,
    toggleComponent,
    setTheme,
    setLanguage,
    setAccentColor,
    reportHealthIssue,
    clearHealthIssues,
    resetLayout,
    highlightComponent,
  };
}

