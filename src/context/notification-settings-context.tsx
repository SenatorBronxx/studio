
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useUserPreferences } from './user-preferences-context';

type NotificationSettings = {
  routeAlerts: boolean;
  bookingAlerts: boolean;
  systemAlerts: boolean;
};

type NotificationSettingsContextType = NotificationSettings & {
  setRouteAlerts: (value: boolean) => void;
  setBookingAlerts: (value: boolean) => void;
  setSystemAlerts: (value: boolean) => void;
  isHydrated: boolean;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined);

const defaultSettings: NotificationSettings = {
  routeAlerts: true,
  bookingAlerts: true,
  systemAlerts: false,
};

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();

  const settings = preferences?.notificationSettings ?? defaultSettings;

  const setRouteAlerts = useCallback((value: boolean) => {
    const currentSettings = preferences?.notificationSettings ?? defaultSettings;
    setPreference('notificationSettings', { ...currentSettings, routeAlerts: value });
  }, [setPreference, preferences?.notificationSettings]);
  
  const setBookingAlerts = useCallback((value: boolean) => {
    const currentSettings = preferences?.notificationSettings ?? defaultSettings;
    setPreference('notificationSettings', { ...currentSettings, bookingAlerts: value });
  }, [setPreference, preferences?.notificationSettings]);

  const setSystemAlerts = useCallback((value: boolean) => {
    const currentSettings = preferences?.notificationSettings ?? defaultSettings;
    setPreference('notificationSettings', { ...currentSettings, systemAlerts: value });
  }, [setPreference, preferences?.notificationSettings]);
  
  const value = {
    ...settings,
    setRouteAlerts,
    setBookingAlerts,
    setSystemAlerts,
    isHydrated
  };

  return (
    <NotificationSettingsContext.Provider value={value}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  const context = useContext(NotificationSettingsContext);
  if (context === undefined) {
    throw new Error('useNotificationSettings must be used within a NotificationSettingsProvider');
  }
  return context;
}
