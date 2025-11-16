
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAppState } from '@/components/client-providers';
import { useUser as useFirebaseUser } from '@/firebase';

type User = {
  name: string;
  email: string;
  phone: string;
  uid: string;
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
  const appState = useAppState();

  // Effect to hydrate user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('eritas-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation
        if (parsedUser && parsedUser.uid) {
            setUserState(parsedUser);
        }
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
          // If a new user is set and it's different from the one in storage, clear data
          const storedUserJson = localStorage.getItem('eritas-user');
          if (storedUserJson) {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser.uid !== newUser.uid) {
              if (appState) appState.clearAllData();
            }
          }
          localStorage.setItem('eritas-user', JSON.stringify(newUser));
        } else {
          // On explicit logout (setUser(null))
          if (appState) appState.clearAllData();
        }
      } catch (error) {
        console.error("Failed to write user to localStorage", error);
      }
    }
  }, [isHydrated, appState]);
  
  if (!isHydrated) {
      return null; // Or a loading spinner
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
