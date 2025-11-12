
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

type SecuritySettings = {
  isPinEnabled: boolean;
  isBiometricEnabled: boolean;
  is2faEnabled: boolean;
};

type SecuritySettingsContextType = SecuritySettings & {
  setIsPinEnabled: (value: boolean) => void;
  setIsBiometricEnabled: (value: boolean) => void;
  setIs2faEnabled: (value: boolean) => void;
  isHydrated: boolean;
};

const SecuritySettingsContext = createContext<SecuritySettingsContextType | undefined>(undefined);

const defaultSettings: SecuritySettings = {
  isPinEnabled: false,
  isBiometricEnabled: true,
  is2faEnabled: false,
};

export function SecuritySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('eritas-security-settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to read security settings from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-security-settings', JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to write security settings to localStorage", error);
      }
    }
  }, [settings, isHydrated]);

  const setIsPinEnabled = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, isPinEnabled: value }));
  }, []);
  
  const setIsBiometricEnabled = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, isBiometricEnabled: value }));
  }, []);

  const setIs2faEnabled = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, is2faEnabled: value }));
  }, []);
  
  const value = {
    ...settings,
    setIsPinEnabled,
    setIsBiometricEnabled,
    setIs2faEnabled,
    isHydrated
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
