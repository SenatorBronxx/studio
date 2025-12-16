
'use server';
/**
 * @fileOverview A flow for admins to delete a user (passenger) account.
 *
 * - deleteUser - Deletes the user from Firebase Auth and their data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const DeleteUserInputSchema = z.object({
  userId: z.string().describe('The UID of the user to be deleted.'),
});

const DeleteUserOutputSchema = z.object({
  message: z.string(),
});

export const deleteUser = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: DeleteUserOutputSchema,
    authPolicy: (auth, input) => {
        if (!auth) {
            throw new Error("Authorization failed: No user authenticated.");
        }
        // This check ensures only admins can delete users.
        if (auth.customClaims?.admin !== true) {
          throw new Error("Authorization failed: User is not an admin.");
        }
    }
  },
  async ({ userId }) => {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
        console.log(`Attempting to delete user: ${userId}`);

        // 1. Delete user from Firebase Authentication
        await auth.deleteUser(userId);
        console.log(`Successfully deleted user ${userId} from Firebase Auth.`);

        // 2. Delete user's document from Firestore
        const userDocRef = firestore.collection('users').doc(userId);
        await userDocRef.delete();
        console.log(`Successfully deleted user document for ${userId} from Firestore.`);
        
        // 3. (Optional but recommended) Delete user's sub-collections, like preferences
        // This is a simple implementation. For complex subcollections, a recursive delete function would be better.
        const preferencesCollectionRef = userDocRef.collection('preferences');
        const preferencesSnapshot = await preferencesCollectionRef.listDocuments();
        if (preferencesSnapshot.length > 0) {
            const batch = firestore.batch();
            preferencesSnapshot.forEach(doc => batch.delete(doc));
            await batch.commit();
            console.log(`Deleted sub-collection data for user ${userId}.`);
        }
        
        const message = `Successfully deleted user ${userId} and all their data.`;
        return { message };

    } catch (error: any) {
        console.error(`Failed to delete user ${userId}:`, error);
        if (error.code === 'auth/user-not-found') {
             // If the user is not in Auth, try to clean up from Firestore anyway
            await firestore.collection('users').doc(userId).delete().catch();
            throw new Error(`User with ID ${userId} not found in Firebase Authentication, but cleanup was attempted.`);
        }
        throw new Error(`An error occurred while deleting user ${userId}: ${error.message}`);
    }
  }
);
