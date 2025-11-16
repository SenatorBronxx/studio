
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAppState } from '@/components/client-providers';
import { useUser as useFirebaseUser } from '@/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

type AppUser = {
  name: string;
  email: string;
  phone: string;
  uid: string;
};

type UserContextType = {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  isHydrated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const appState = useAppState();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseUser();

  // Effect to hydrate user from localStorage on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('eritas-user');
      if (storedUser) {
        const parsedUser: AppUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.uid) {
            setUserState(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to read user from localStorage", error);
    }
    setIsHydrated(true);
  }, []);
  
  // Effect to sync FirebaseUser to our AppUser state
  useEffect(() => {
    if (!firebaseLoading && firebaseUser) {
        const newUser: AppUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous User',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
        };
        setUser(newUser);
    }
  }, [firebaseUser, firebaseLoading]);


  const setUser = useCallback((newUser: AppUser | null) => {
    setUserState(newUser);
    if (isHydrated) {
      try {
        if (newUser) {
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
