
'use server';
/**
 * @fileOverview A flow for admins to list all users and their wallet balances.
 *
 * - listUsers - Retrieves a list of all user profiles from Firestore, including their wallet balance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';
import { PREFERENCES_DOC_ID } from '@/context/user-preferences-context';

// Initialize Firebase Admin SDK
initializeFirebase();

const UserSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  signUpDate: z.string().optional(),
  walletBalance: z.number().optional(),
});

const ListUsersOutputSchema = z.object({
  users: z.array(UserSchema),
});

export const listUsers = ai.defineFlow(
  {
    name: 'listUsersFlow',
    inputSchema: z.void(),
    outputSchema: ListUsersOutputSchema,
    authPolicy: (auth, input) => {
        if (!auth) {
            throw new Error("Authorization failed: No user authenticated.");
        }
        if (auth.customClaims?.admin !== true) {
          throw new Error("Authorization failed: User is not an admin.");
        }
    }
  },
  async () => {
    const firestore = getFirestore();
    const usersSnapshot = await firestore.collection('users').get();
    
    const users = await Promise.all(usersSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      let walletBalance = 0;

      // Fetch the preferences subcollection for each user
      try {
        const prefsRef = doc.ref.collection('preferences').doc(PREFERENCES_DOC_ID);
        const prefsDoc = await prefsRef.get();
        if (prefsDoc.exists()) {
          walletBalance = prefsDoc.data()?.walletBalance || 0;
        }
      } catch (error) {
        console.warn(`Could not fetch wallet balance for user ${doc.id}:`, error);
      }
      
      return {
        id: doc.id,
        email: data.email || 'N/A',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        signUpDate: data.signUpDate?.toDate?.().toISOString() || 'N/A',
        walletBalance: walletBalance,
      };
    }));

    return { users };
  }
);
