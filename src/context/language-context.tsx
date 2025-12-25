
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import tw from '@/locales/tw.json';
import { useUserPreferences } from './user-preferences-context';

const translations: Record<string, Record<string, string>> = {
  'en-us': en,
  'en-gb': en, // Using same as US for now
  'tw': tw,
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();

  const language = preferences?.language ?? 'en-us';
  
  const setLanguage = useCallback((lang: string) => {
    setPreference('language', lang);
  }, [setPreference]);

  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    let translation = translations[language]?.[key] || translations['en-us'][key] || key;
    
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }

    return translation;
  }, [language]);
  
  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
