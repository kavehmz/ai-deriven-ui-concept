import { useCallback } from 'react';
import { getTranslation, TranslationKey } from './translations';

export function useTranslation(language: string) {
  const t = useCallback(
    (key: TranslationKey): string => {
      return getTranslation(language, key);
    },
    [language]
  );

  return { t, language };
}

