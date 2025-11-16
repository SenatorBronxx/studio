// src/firebase/provider.tsx
'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { ReactNode, createContext, useContext } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export type FirebaseProviderProps = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  children?: ReactNode;
};

const FirebaseContext = createContext<FirebaseProviderProps | null>(null);

export function FirebaseProvider({
  firebaseApp,
  auth,
  firestore,
  children,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;
