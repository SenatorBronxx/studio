
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

type NotificationSettingsContextType = {
  routeAlerts: boolean;
  setRouteAlerts: (value: boolean) => void;
  bookingAlerts: boolean;
  setBookingAlerts: (value: boolean) => void;
  systemAlerts: boolean;
  setSystemAlerts: (value: boolean) => void;
  isHydrated: boolean;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined);

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [routeAlerts, setRouteAlertsState] = useState(true);
  const [bookingAlerts, setBookingAlertsState] = useState(true);
  const [systemAlerts, setSystemAlertsState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        const { routeAlerts, bookingAlerts, systemAlerts } = JSON.parse(storedSettings);
        setRouteAlertsState(routeAlerts ?? true);
        setBookingAlertsState(bookingAlerts ?? true);
        setSystemAlertsState(systemAlerts ?? true);
      }
    } catch (error) {
      console.error("Failed to load notification settings from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const persistSettings = (settings: object) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save notification settings to localStorage", error);
    }
  };

  const setRouteAlerts = useCallback((value: boolean) => {
    setRouteAlertsState(value);
    persistSettings({ routeAlerts: value, bookingAlerts, systemAlerts });
  }, [bookingAlerts, systemAlerts]);

  const setBookingAlerts = useCallback((value: boolean) => {
    setBookingAlertsState(value);
    persistSettings({ routeAlerts, bookingAlerts: value, systemAlerts });
  }, [routeAlerts, systemAlerts]);

  const setSystemAlerts = useCallback((value: boolean) => {
    setSystemAlertsState(value);
    persistSettings({ routeAlerts, bookingAlerts, systemAlerts: value });
  }, [routeAlerts, bookingAlerts]);

  const value = {
    routeAlerts,
    setRouteAlerts,
    bookingAlerts,
    setBookingAlerts,
    systemAlerts,
    setSystemAlerts,
    isHydrated,
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
