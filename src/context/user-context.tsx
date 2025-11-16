
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

type User = {
  name: string;
  email: string;
  phone: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isHydrated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('eritas-user');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to read user from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  const setUser = useCallback((user: User | null) => {
    setUserState(user);
    if (isHydrated) {
      try {
        if (user) {
          localStorage.setItem('eritas-user', JSON.stringify(user));
        } else {
          // On logout, clear all app-specific data except theme/language
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('eritas-') && key !== 'eritas-language' && key !== 'eritas-theme') {
              localStorage.removeItem(key);
            }
          });
          // A reload might be necessary to fully reset all context states
          // window.location.reload(); 
        }
      } catch (error) {
        console.error("Failed to write user to localStorage", error);
      }
    }
  }, [isHydrated]);

  return (
    <UserContext.Provider value={{ user, setUser, isHydrated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
