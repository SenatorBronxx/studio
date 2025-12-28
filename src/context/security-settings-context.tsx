
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

type SecuritySettingsContextType = {
  isPinEnabled: boolean;
  setIsPinEnabled: (value: boolean) => void;
  is2faEnabled: boolean;
  setIs2faEnabled: (value: boolean) => void;
  isHydrated: boolean;
};

const SecuritySettingsContext = createContext<SecuritySettingsContextType | undefined>(undefined);

export function SecuritySettingsProvider({ children }: { children: ReactNode }) {
  const [isPinEnabled, setIsPinEnabledState] = useState(false);
  const [is2faEnabled, setIs2faEnabledState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('securitySettings');
      if (storedSettings) {
        const { isPinEnabled, is2faEnabled } = JSON.parse(storedSettings);
        setIsPinEnabledState(isPinEnabled ?? false);
        setIs2faEnabledState(is2faEnabled ?? false);
      }
    } catch (error) {
      console.error("Failed to load security settings from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const persistSettings = (settings: object) => {
    try {
      localStorage.setItem('securitySettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save security settings to localStorage", error);
    }
  };

  const setIsPinEnabled = useCallback((value: boolean) => {
    setIsPinEnabledState(value);
    persistSettings({ isPinEnabled: value, is2faEnabled });
  }, [is2faEnabled]);

  const setIs2faEnabled = useCallback((value: boolean) => {
    setIs2faEnabledState(value);
    persistSettings({ isPinEnabled, is2faEnabled: value });
  }, [isPinEnabled]);

  const value = {
    isPinEnabled,
    setIsPinEnabled,
    is2faEnabled,
    setIs2faEnabled,
    isHydrated,
  };

  return (
    <SecuritySettingsContext.Provider value={value}>
      {children}
    </SecuritySettingsContext.Provider>
  );
}

export function useSecuritySettings() {
  const context = useContext(SecuritySettingsContext);
  if (context === undefined) {
    throw new Error('useSecuritySettings must be used within a SecuritySettingsProvider');
  }
  return context;
}
