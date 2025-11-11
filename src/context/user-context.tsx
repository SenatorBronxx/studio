
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type User = {
  name: string;
  email: string;
  phone: string;
};

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: 'Ama Serwaa',
  email: 'ama.s@email.com',
  phone: '+233 24 123 4567',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(INITIAL_USER);
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
  
  const setUser = (newUser: User) => {
    setUserState(newUser);
    try {
      localStorage.setItem('eritas-user', JSON.stringify(newUser));
    } catch (error) {
      console.error("Failed to write user to localStorage", error);
    }
  };
  
  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
