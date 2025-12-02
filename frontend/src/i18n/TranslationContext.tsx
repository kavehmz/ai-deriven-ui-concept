import { createContext, useContext, ReactNode } from 'react';
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
  const t = (key: TranslationKey): string => getTranslation(language, key);

  return (
    <TranslationContext.Provider value={{ t, language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}

