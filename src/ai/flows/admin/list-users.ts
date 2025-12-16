
'use server';
/**
 * @fileOverview A flow for admins to list all users.
 *
 * - listUsers - Retrieves a list of all user profiles from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const UserSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  signUpDate: z.string().optional(),
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
        // In a real app, you would verify the caller is an admin.
        if (!auth) {
            throw new Error("Authorization failed: No user authenticated.");
        }
        // This check ensures only admins can list users.
        if (auth.customClaims?.admin !== true) {
          throw new Error("Authorization failed: User is not an admin.");
        }
    }
  },
  async () => {
    const firestore = getFirestore();
    const usersSnapshot = await firestore.collection('users').get();
    
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || 'N/A',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        // Convert Firestore Timestamp to ISO string if it exists
        signUpDate: data.signUpDate?.toDate?.().toISOString() || 'N/A',
      };
    });

    return { users };
  }
);
