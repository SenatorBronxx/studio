
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useUserPreferences } from './user-preferences-context';

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
  const { preferences, setPreference, isHydrated } = useUserPreferences();

  const settings = preferences?.securitySettings ?? defaultSettings;

  const setIsPinEnabled = useCallback((value: boolean) => {
    const currentSettings = preferences?.securitySettings ?? defaultSettings;
    setPreference('securitySettings', { ...currentSettings, isPinEnabled: value });
  }, [setPreference, preferences?.securitySettings]);
  
  const setIsBiometricEnabled = useCallback((value: boolean) => {
    const currentSettings = preferences?.securitySettings ?? defaultSettings;
    setPreference('securitySettings', { ...currentSettings, isBiometricEnabled: value });
  }, [setPreference, preferences?.securitySettings]);

  const setIs2faEnabled = useCallback((value: boolean) => {
    const currentSettings = preferences?.securitySettings ?? defaultSettings;
    setPreference('securitySettings', { ...currentSettings, is2faEnabled: value });
  }, [setPreference, preferences?.securitySettings]);
  
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
