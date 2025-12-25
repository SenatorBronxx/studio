'use server';
/**
 * @fileOverview Development tools for administrative actions.
 *
 * DANGEROUS: These flows perform destructive operations and should be
 * used with extreme caution. They are intended for development and
 * testing purposes only.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// --- Firebase Admin Initialization ---
// Ensure Firebase Admin is initialized before any operations.
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

// --- Output Schema ---
const DeletionResultSchema = z.object({
  deletedUsersCount: z.number().describe('The total number of users deleted.'),
  errors: z.array(z.string()).describe('A list of any errors that occurred during deletion.'),
});
export type DeletionResult = z.infer<typeof DeletionResultSchema>;


/**
 * DANGEROUS: Deletes all users from Firebase Authentication and their
 * corresponding documents in the 'users' collection in Firestore.
 * This action is irreversible.
 *
 * @returns {Promise<DeletionResult>} A result object with the count of deleted users and any errors.
 */
export async function deleteAllUsers(): Promise<DeletionResult> {
  return deleteAllUsersFlow();
}


// --- Genkit Flow Definition ---
const deleteAllUsersFlow = ai.defineFlow(
  {
    name: 'deleteAllUsersFlow',
    inputSchema: z.void(),
    outputSchema: DeletionResultSchema,
  },
  async () => {
    const auth = getAuth();
    const db = getFirestore();
    const errors: string[] = [];
    let deletedUsersCount = 0;

    try {
      // List all users from Firebase Authentication
      const listUsersResult = await auth.listUsers(1000); // Batched in 1000s

      const userDeletionPromises = listUsersResult.users.map(async (userRecord) => {
        const uid = userRecord.uid;
        try {
          // 1. Delete the user from Firebase Authentication
          await auth.deleteUser(uid);

          // 2. Delete the user's document from the 'users' collection in Firestore
          const userDocRef = db.collection('users').doc(uid);
          await userDocRef.delete();
          
          // Optionally, you could also delete subcollections if they exist
          // For example: await db.recursiveDelete(userDocRef);

          deletedUsersCount++;
        } catch (error: any) {
          console.error(`Failed to delete user ${uid}:`, error);
          errors.push(`Failed to delete user ${uid}: ${error.message}`);
        }
      });

      // Wait for all deletion operations to complete
      await Promise.all(userDeletionPromises);

      if (listUsersResult.pageToken) {
        // In a real-world scenario with more than 1000 users, you would need to
        // handle pagination here using listUsersResult.pageToken.
        console.warn("More than 1000 users exist; this flow only deletes the first 1000.");
      }

      return { deletedUsersCount, errors };

    } catch (error: any) {
      console.error("An error occurred while listing users:", error);
      errors.push(`An error occurred while listing users: ${error.message}`);
      return { deletedUsersCount: 0, errors };
    }
  }
);
