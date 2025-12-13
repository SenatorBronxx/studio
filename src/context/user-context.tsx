
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUser as useFirebaseUser, UserHookResult } from '@/firebase';
import { useRouter } from 'next/navigation';

type UserContextType = UserHookResult;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userHookResult = useFirebaseUser();
  
  return (
    <UserContext.Provider value={userHookResult}>
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
