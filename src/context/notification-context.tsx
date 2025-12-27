
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

export type Notification = {
    id: number;
    title: string;
    description: string;
    tripId?: string;
    action?: React.ReactNode;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  clearNotifications: () => void;
  isHydrated: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        // We only load the non-component data. Actions will be lost on reload, which is acceptable.
        const loadedNotifications = JSON.parse(storedNotifications).map((n: any) => ({...n, action: undefined}));
        setNotifications(loadedNotifications);
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const persistNotifications = (notificationsToPersist: Notification[]) => {
    try {
      // Create a version of notifications for storage without React components
      const storableNotifications = notificationsToPersist.map(({ action, ...rest }) => rest);
      localStorage.setItem('notifications', JSON.stringify(storableNotifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage", error);
    }
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => {
        const newNotifications = [newNotification, ...prev];
        persistNotifications(newNotifications);
        return newNotifications;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    persistNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    clearNotifications,
    isHydrated,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
