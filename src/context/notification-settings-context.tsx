
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

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
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('eritas-notification-settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to read notification settings from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-notification-settings', JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to write notification settings to localStorage", error);
      }
    }
  }, [settings, isHydrated]);

  const setRouteAlerts = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, routeAlerts: value }));
  }, []);
  
  const setBookingAlerts = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, bookingAlerts: value }));
  }, []);

  const setSystemAlerts = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, systemAlerts: value }));
  }, []);
  
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
