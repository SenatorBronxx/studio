
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

  const clearAllData = useCallback(() => {
    console.log('Clearing all user-specific data from localStorage...');
    const language = localStorage.getItem('eritas-language');
    const theme = localStorage.getItem('eritas-theme');
    
    localStorage.clear();

    if (language) localStorage.setItem('eritas-language', language);
    if (theme) localStorage.setItem('eritas-theme', theme);
    
    // Redirect to home and reload to ensure all context state is cleared
    window.location.assign('/');
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (isHydrated) {
      try {
        if (newUser) {
           const storedUserJson = localStorage.getItem('eritas-user');
           // Clear previous user's data if the user is different
           if (storedUserJson) {
             const storedUser = JSON.parse(storedUserJson);
             if (storedUser.name !== newUser.name) {
               console.log("New user detected, clearing all old data.");
               clearAllData();
             }
           }
          localStorage.setItem('eritas-user', JSON.stringify(newUser));
        } else {
          // On explicit logout (setUser(null)), clear all data.
          console.log("User logged out, clearing all data.");
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
