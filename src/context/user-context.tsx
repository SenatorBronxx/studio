
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useAppState } from '@/components/client-providers';

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
  const { clearAllData } = useAppState();
  const previousUserRef = useRef<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('eritas-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
        previousUserRef.current = parsedUser;
      }
    } catch (error) {
      console.error("Failed to read user from localStorage", error);
    }
    setIsHydrated(true);
  }, []);
  
  const setUser = useCallback((newUser: User | null) => {
    const previousUser = previousUserRef.current;

    // Check if logging out (newUser is null and there was a previous user)
    // or if logging in as a different user (phone number is a good unique identifier)
    const isLogout = !newUser && previousUser;
    const isDifferentUser = newUser && previousUser && newUser.phone !== previousUser.phone;

    if (isLogout || isDifferentUser) {
      clearAllData();
    } else {
        setUserState(newUser);
        previousUserRef.current = newUser;
        try {
          if (newUser) {
            localStorage.setItem('eritas-user', JSON.stringify(newUser));
          } else {
            localStorage.removeItem('eritas-user');
          }
        } catch (error) {
          console.error("Failed to write user to localStorage", error);
        }
    }
  }, [clearAllData]);

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
