
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

export function UserProvider({ children, clearAllData }: { children: ReactNode, clearAllData: () => void }) {
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

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (isHydrated) {
      try {
        if (newUser) {
          const storedUserJson = localStorage.getItem('eritas-user');
          if (storedUserJson) {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser.name !== newUser.name) {
              clearAllData();
            }
          }
          localStorage.setItem('eritas-user', JSON.stringify(newUser));
        } else {
          // On explicit logout (setUser(null))
          clearAllData();
        }
      } catch (error) {
        console.error("Failed to write user to localStorage", error);
      }
    }
  }, [isHydrated, clearAllData]);
  
  if (!isHydrated) {
      return null;
  }

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
