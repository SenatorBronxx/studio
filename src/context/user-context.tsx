
'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

// This is a simplified user object for a DB-less experience
type User = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string;
};

type UserContextType = {
  user: User | null;
  // In a real app, you'd have functions like login, logout, etc.
  // For this mock, we'll just have a static user.
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for a DB-less experience
const mockUser: User = {
    uid: 'mock-user-id',
    displayName: 'Eritas User',
    email: 'user@eritas.app',
    photoURL: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dXNlciUyMGF2YXRhcnxlbnwwfHx8fDE3NjI2MzIyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
};


export function UserProvider({ children }: { children: ReactNode }) {
  // In this mock setup, the user is always "logged in".
  const [user] = useState<User | null>(mockUser);

  const value = { user };

  return (
    <UserContext.Provider value={value}>
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
