import { useState, useEffect, useCallback } from 'react';
import { UIState, UIUpdate } from '../types';

const STORAGE_KEY = 'amy-ui-state';

const defaultUIState: UIState = {
  theme: 'dark',
  language: 'en',
  visibleComponents: ['watchlist', 'portfolio', 'chart', 'news'],
  layout: 'standard',
  primaryColor: '#3b82f6',
  fontSize: 'medium',
};

export function useUIState() {
  const [uiState, setUIState] = useState<UIState>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultUIState, ...JSON.parse(stored) };
      } catch {
        return defaultUIState;
      }
    }
    return defaultUIState;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uiState));
  }, [uiState]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(uiState.theme);
  }, [uiState.theme]);

  // Apply primary color as CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', uiState.primaryColor);
  }, [uiState.primaryColor]);

  // Apply UI updates from AI
  const applyUIUpdate = useCallback((update: UIUpdate) => {
    setUIState((prev) => {
      const newState = { ...prev };

      if (update.theme) {
        newState.theme = update.theme;
      }

      if (update.language) {
        newState.language = update.language;
      }

      if (update.layout) {
        newState.layout = update.layout;
      }

      if (update.primaryColor) {
        newState.primaryColor = update.primaryColor;
      }

      if (update.fontSize) {
        newState.fontSize = update.fontSize;
      }

      // Handle show/hide components
      let components = [...prev.visibleComponents];

      if (update.hideComponents) {
        components = components.filter((c) => !update.hideComponents!.includes(c));
      }

      if (update.showComponents) {
        update.showComponents.forEach((c) => {
          if (!components.includes(c)) {
            components.push(c);
          }
        });
      }

      newState.visibleComponents = components;

      return newState;
    });
  }, []);

  const resetUI = useCallback(() => {
    setUIState(defaultUIState);
  }, []);

  return { uiState, applyUIUpdate, resetUI, setUIState };
}

