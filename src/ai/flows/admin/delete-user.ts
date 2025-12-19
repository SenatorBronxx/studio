
'use server';
/**
 * @fileOverview A flow for deleting a user account.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

const DeleteUserInputSchema = z.object({
  userId: z.string().describe('The UID of the user to delete.'),
});

const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export async function deleteUser(
  input: z.infer<typeof DeleteUserInputSchema>
): Promise<z.infer<typeof DeleteUserOutputSchema>> {
  return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: DeleteUserOutputSchema,
  },
  async ({ userId }) => {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    try {
      const db = getFirestore();
      
      // 1. Delete user's main Firestore document
      await db.collection('users').doc(userId).delete();
      
      // 2. Delete user's preferences document
      await db.collection('users').doc(userId).collection('preferences').doc('user-prefs').delete();

      // 3. Delete user from Firebase Authentication
      await getAuth().deleteUser(userId);
      
      return {
        success: true,
        message: `User with ID ${userId} has been deleted.`,
      };
    } catch (error: any) {
      console.error(`Error deleting user ${userId}:`, error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
);
