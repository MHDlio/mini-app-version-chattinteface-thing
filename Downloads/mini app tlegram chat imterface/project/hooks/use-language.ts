import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type LanguageCode, SUPPORTED_LANGUAGES, isRTL } from '@/lib/i18n/languages';

interface LanguageState {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  isRTL: boolean;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      isRTL: false,
      setLanguage: (language) =>
        set({
          currentLanguage: language,
          isRTL: isRTL(language),
        }),
    }),
    {
      name: 'language-storage',
    }
  )
);