
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';

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

// A simple function to clear user-specific data from localStorage
const clearUserData = () => {
    console.log('Clearing all user-specific data from localStorage...');
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('eritas-') && key !== 'eritas-language' && key !== 'eritas-theme') {
            localStorage.removeItem(key);
        }
    });
    window.location.reload(); // Reload to reset all states
};


export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
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
    
    const isLogout = !newUser && previousUser;
    const isDifferentUser = newUser && previousUser && newUser.email !== previousUser.email;

    if (isLogout || isDifferentUser) {
        // Clear all contexts by clearing localStorage and reloading
        clearUserData();
    } else {
        setUserState(newUser);
        previousUserRef.current = newUser;
        if (isHydrated) {
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
