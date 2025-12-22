'use server';
/**
 * @fileOverview A flow for listing all registered users (passengers).
 *
 * - listUsers - Fetches and returns a list of all user documents and their wallet balance.
 * - ListUsersOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// --- Firebase Admin Initialization ---
if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}


// --- Output Schema ---
const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  walletBalance: z.number().optional(),
});
const ListUsersOutputSchema = z.object({
  users: z.array(UserSchema),
});

export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;


// --- Exported Flow Function ---
export async function listUsers(): Promise<ListUsersOutput> {
  return listUsersFlow();
}


// --- Genkit Flow Definition ---
const listUsersFlow = ai.defineFlow(
  {
    name: 'listUsersFlow',
    inputSchema: z.void(),
    outputSchema: ListUsersOutputSchema,
  },
  async () => {
    const db = getFirestore();
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      return { users: [] };
    }

    // Get all the preference documents to fetch wallet balances
    const preferencesPromises = usersSnapshot.docs.map(doc =>
      db.collection('users').doc(doc.id).collection('preferences').doc('user-prefs').get()
    );
    
    const preferencesSnapshots = await Promise.all(preferencesPromises);

    const users = usersSnapshot.docs.map((userDoc, index) => {
      const userData = userDoc.data();
      const preferencesDoc = preferencesSnapshots[index];
      const preferencesData = preferencesDoc.exists ? preferencesDoc.data() : {};
      
      return {
        id: userDoc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        walletBalance: preferencesData?.walletBalance || 0,
      };
    });

    return { users };
  }
);
