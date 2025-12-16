'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export interface UserHookResult {
  user: (User & { customClaims?: { [key: string]: any } }) | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook specifically for accessing the authenticated user's state, including custom claims.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const [user, setUser] = useState<(User & { customClaims?: { [key: string]: any } }) | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idTokenResult = await firebaseUser.getIdTokenResult();
            const userWithClaims = {
              ...firebaseUser,
              customClaims: idTokenResult.claims,
            };
            setUser(userWithClaims as User & { customClaims?: { [key: string]: any } });
          } catch (error) {
            console.error("Error getting user claims:", error);
            setUser(firebaseUser); // Fallback to user without claims
            setUserError(error instanceof Error ? error : new Error('Failed to get token result'));
          }
        } else {
          setUser(null);
        }
        setIsUserLoading(false);
      },
      (error) => {
        console.error("Auth state listener error:", error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading, userError };
};
