
'use server';
/**
 * @fileOverview A flow for admins to delete a driver account and associated data.
 *
 * - deleteDriver - Deletes the driver from Firebase Auth and their data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const DeleteDriverInputSchema = z.object({
  driverId: z.string().describe('The UID of the driver to be deleted.'),
});

const DeleteDriverOutputSchema = z.object({
  message: z.string(),
});

export const deleteDriver = ai.defineFlow(
  {
    name: 'deleteDriverFlow',
    inputSchema: DeleteDriverInputSchema,
    outputSchema: DeleteDriverOutputSchema,
    authPolicy: (auth, input) => {
        if (!auth) {
            throw new Error("Authorization failed: No user authenticated.");
        }
        // This check ensures only admins can perform this action.
        if (auth.customClaims?.admin !== true) {
          throw new Error("Authorization failed: User is not an admin.");
        }
    }
  },
  async ({ driverId }) => {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
        console.log(`Attempting to delete driver: ${driverId}`);
        const driverDocRef = firestore.collection('drivers').doc(driverId);
        const driverDoc = await driverDocRef.get();
        const driverData = driverDoc.data();

        // 1. Delete user from Firebase Authentication
        await auth.deleteUser(driverId);
        console.log(`Successfully deleted driver ${driverId} from Firebase Auth.`);

        // 2. Delete driver's document from Firestore
        await driverDocRef.delete();
        console.log(`Successfully deleted driver document for ${driverId} from Firestore.`);

        // 3. Delete the associated registration code, if it exists
        if (driverData?.registrationCode) {
            const codeRef = firestore.collection('registrationCodes').doc(driverData.registrationCode);
            await codeRef.delete();
            console.log(`Successfully deleted registration code ${driverData.registrationCode}.`);
        }
        
        const message = `Successfully deleted driver ${driverId} and all associated data.`;
        return { message };

    } catch (error: any) {
        console.error(`Failed to delete driver ${driverId}:`, error);
         if (error.code === 'auth/user-not-found') {
             // If the user is not in Auth, try to clean up from Firestore anyway
            await firestore.collection('drivers').doc(driverId).delete().catch();
            throw new Error(`Driver with ID ${driverId} not found in Firebase Authentication, but cleanup was attempted.`);
        }
        throw new Error(`An error occurred while deleting driver ${driverId}: ${error.message}`);
    }
  }
);
