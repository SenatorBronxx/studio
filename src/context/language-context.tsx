
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import tw from '@/locales/tw.json';
import ka from '@/locales/ka.json';

// Add other language imports here
// import ga from '@/locales/ga.json';

const translations: Record<string, Record<string, string>> = {
  'en-us': en,
  'en-gb': en, // Using same as US for now
  'tw': tw,
  'ga': {}, // Placeholder
  'ew': {}, // Placeholder
  'sf': {}, // Placeholder
  'ha': {}, // Placeholder
  'ka': ka,
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en-us');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('eritas-language');
    if (storedLanguage && translations[storedLanguage]) {
      setLanguageState(storedLanguage);
    }
    setIsHydrated(true);
  }, []);
  
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    if(isHydrated) {
        localStorage.setItem('eritas-language', lang);
    }
  }, [isHydrated]);

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
