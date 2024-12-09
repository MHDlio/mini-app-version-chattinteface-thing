'use client';

import { useLanguage } from './use-language';
import { translations } from '@/lib/i18n/translations';

type Language = 'en' | 'ar' | 'de';
const DEFAULT_LANGUAGE: Language = 'en';

export function useTranslations() {
  const { currentLanguage } = useLanguage();
  
  function t(key: string, fallback?: string): string {
    const lang = currentLanguage as Language;
    const keys = key.split('.');
    let value = translations[lang] || translations[DEFAULT_LANGUAGE];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        // Try fallback language if translation is missing
        if (lang !== DEFAULT_LANGUAGE) {
          let fallbackValue = translations[DEFAULT_LANGUAGE];
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk as keyof typeof fallbackValue];
            } else {
              return fallback || key;
            }
          }
          return fallbackValue as string;
        }
        return fallback || key;
      }
    }
    
    return value as string;
  }

  return { t };
}