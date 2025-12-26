
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';

export const PREFERENCES_DOC_ID = 'userPreferences';

type Preferences = {
  language?: string;
  food?: string;
  music?: string;
  destination?: string;
};

type UserPreferencesContextType = {
  preferences: Preferences | null;
  setPreference: (key: keyof Preferences, value: string) => void;
  isHydrated: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const initialPreferences: Preferences = {
  language: 'en-us',
  food: '',
  music: '',
  destination: '',
};

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // In a DB-less app, we can load from localStorage
    try {
        const storedPrefs = localStorage.getItem('userPreferences');
        if (storedPrefs) {
            setPreferences(JSON.parse(storedPrefs));
        } else {
            setPreferences(initialPreferences);
        }
    } catch (error) {
        console.error("Failed to load preferences from localStorage", error);
        setPreferences(initialPreferences);
    }
    setIsHydrated(true);
  }, []);

  const setPreference = useCallback((key: keyof Preferences, value: string) => {
    setPreferences(prev => {
        const newPrefs = { ...(prev || initialPreferences), [key]: value };
        try {
            localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
        } catch (error) {
             console.error("Failed to save preferences to localStorage", error);
             toast({
                variant: 'destructive',
                title: t('uhOhSomethingWentWrong'),
                description: 'Could not save your preferences.',
             });
        }
        return newPrefs;
    });
  }, [t, toast]);
  
  const value = { preferences, setPreference, isHydrated };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
