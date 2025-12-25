
'use client';

import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Track } from './music-context';
import type { ActiveTrip } from './trip-context';

// --- Types ---

type Transaction = {
  id: string;
  type: 'payment' | 'top-up';
  plate: string;
  amount: number;
};

type SavedPlace = {
  id: string;
  type: 'home' | 'work' | 'other';
  address: string;
};

type Discount = {
    code: string;
    percentage: number;
    description: string;
};

export interface UserPreferences {
  id: string;
  language: string;
  walletBalance: number;
  loyaltyPoints: number;
  transactions: Transaction[];
  savedSongs: Track[];
  activeDiscount: Discount | null;
  activeTrip: ActiveTrip | null;
  isDiscountBannerDismissed: boolean;
  notificationSettings: {
    routeAlerts: boolean;
    bookingAlerts: boolean;
    systemAlerts: boolean;
  };
  securitySettings: {
    isPinEnabled: boolean;
    isBiometricEnabled: boolean;
    is2faEnabled: boolean;
  };
  savedPlaces: SavedPlace[];
}

// All fields in UserPreferences are optional for partial updates
type UserPreferencesUpdate = Partial<UserPreferences>;

type UserPreferencesContextType = {
  preferences: UserPreferences | null;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updatePreferences: (updates: UserPreferencesUpdate) => void;
  isHydrated: boolean;
  isLoading: boolean;
  error: Error | null;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// --- Constants ---

export const PREFERENCES_DOC_ID = 'user-prefs';

const defaultPreferences: Omit<UserPreferences, 'id'> = {
    language: 'en-us',
    walletBalance: 0.00,
    loyaltyPoints: 0,
    transactions: [],
    savedSongs: [],
    activeDiscount: null,
    activeTrip: null,
    isDiscountBannerDismissed: false,
    notificationSettings: {
        routeAlerts: true,
        bookingAlerts: true,
        systemAlerts: false,
    },
    securitySettings: {
        isPinEnabled: false,
        isBiometricEnabled: true,
        is2faEnabled: false,
    },
    savedPlaces: [],
};


// --- Provider ---

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userPrefsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'preferences', PREFERENCES_DOC_ID);
  }, [user, firestore]);

  const { data: preferences, isLoading, error } = useDoc<UserPreferences>(userPrefsRef);
  const isHydrated = !isUserLoading && !isLoading;

  const createInitialPreferences = useCallback(async () => {
    if (!userPrefsRef) return;
    
    const initialData: UserPreferences = {
        id: PREFERENCES_DOC_ID,
        ...defaultPreferences
    };
    
    setDoc(userPrefsRef, initialData).catch(err => {
      const permissionError = new FirestorePermissionError({
        path: userPrefsRef.path,
        operation: 'create',
        requestResourceData: initialData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [userPrefsRef]);

  // When the hook is hydrated and there's no data and no error, it's a new user.
  // We need to create their initial preferences document.
  useMemo(() => {
    if (isHydrated && !preferences && !error) {
      createInitialPreferences();
    }
  }, [isHydrated, preferences, error, createInitialPreferences]);


  const setPreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      if (!userPrefsRef) return;
      
      const updateData = { [key]: value };

      updateDoc(userPrefsRef, updateData).catch(err => {
        const permissionError = new FirestorePermissionError({
            path: userPrefsRef.path,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }, [userPrefsRef]);


  const updatePreferences = useCallback((updates: UserPreferencesUpdate) => {
    if (!userPrefsRef) return;

    updateDoc(userPrefsRef, updates).catch(err => {
        const permissionError = new FirestorePermissionError({
            path: userPrefsRef.path,
            operation: 'update',
            requestResourceData: updates
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }, [userPrefsRef]);

  const value = {
    preferences: preferences || (defaultPreferences as UserPreferences),
    setPreference,
    updatePreferences,
    isHydrated,
    isLoading,
    error
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// --- Hook ---

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
