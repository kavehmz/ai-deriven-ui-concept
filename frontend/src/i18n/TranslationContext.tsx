import { createContext, useContext, ReactNode, useMemo } from 'react';
import { getTranslation, TranslationKey } from './translations';

type TranslationFunction = (key: TranslationKey) => string;

const TranslationContext = createContext<{
  t: TranslationFunction;
  language: string;
}>({
  t: (key) => key,
  language: 'en',
});

interface TranslationProviderProps {
  language: string;
  children: ReactNode;
}

export function TranslationProvider({ language, children }: TranslationProviderProps) {
  // Memoize the context value to ensure it updates when language changes
  const contextValue = useMemo(() => ({
    t: (key: TranslationKey): string => getTranslation(language, key),
    language,
  }), [language]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}

