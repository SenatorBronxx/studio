
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

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();

  const settings = preferences?.notificationSettings || {
    routeAlerts: true,
    bookingAlerts: true,
    systemAlerts: false,
  };

  const setRouteAlerts = useCallback((value: boolean) => {
    setPreference('notificationSettings', { ...settings, routeAlerts: value });
  }, [setPreference, settings]);
  
  const setBookingAlerts = useCallback((value: boolean) => {
    setPreference('notificationSettings', { ...settings, bookingAlerts: value });
  }, [setPreference, settings]);

  const setSystemAlerts = useCallback((value: boolean) => {
    setPreference('notificationSettings', { ...settings, systemAlerts: value });
  }, [setPreference, settings]);
  
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
