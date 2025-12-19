
'use server';
/**
 * @fileOverview A flow for listing all user accounts.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

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

export async function listUsers(): Promise<
  z.infer<typeof ListUsersOutputSchema>
> {
  return listUsersFlow();
}

const listUsersFlow = ai.defineFlow(
  {
    name: 'listUsersFlow',
    inputSchema: z.void(),
    outputSchema: ListUsersOutputSchema,
  },
  async () => {
    const db = getFirestore();
    const usersSnapshot = await db.collection('users').get();
    const preferencesPromises = [];

    if (usersSnapshot.empty) {
      return { users: [] };
    }

    // Get user data and prepare to fetch preferences
    const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    for (const user of usersData) {
      preferencesPromises.push(db.collection('users').doc(user.id).collection('preferences').doc('user-prefs').get());
    }
    
    const preferencesSnapshots = await Promise.all(preferencesPromises);

    const users = usersData.map((user, index) => {
      const preferencesDoc = preferencesSnapshots[index];
      const preferencesData = preferencesDoc.exists ? preferencesDoc.data() : {};
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        walletBalance: preferencesData?.walletBalance || 0,
      };
    });

    return { users };
  }
);
