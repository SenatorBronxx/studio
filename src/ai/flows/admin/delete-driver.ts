
'use server';
/**
 * @fileOverview A flow for deleting a driver account.
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

const DeleteDriverInputSchema = z.object({
  driverId: z.string().describe('The UID of the driver to delete.'),
});

const DeleteDriverOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export async function deleteDriver(
  input: z.infer<typeof DeleteDriverInputSchema>
): Promise<z.infer<typeof DeleteDriverOutputSchema>> {
  return deleteDriverFlow(input);
}

const deleteDriverFlow = ai.defineFlow(
  {
    name: 'deleteDriverFlow',
    inputSchema: DeleteDriverInputSchema,
    outputSchema: DeleteDriverOutputSchema,
  },
  async ({ driverId }) => {
    if (!driverId) {
      throw new Error('Driver ID is required.');
    }

    try {
      const db = getFirestore();
      
      // 1. Delete driver's Firestore document
      await db.collection('drivers').doc(driverId).delete();

      // 2. Delete driver from Firebase Authentication
      await getAuth().deleteUser(driverId);
      
      return {
        success: true,
        message: `Driver with ID ${driverId} has been deleted.`,
      };
    } catch (error: any) {
      console.error(`Error deleting driver ${driverId}:`, error);
      throw new Error(`Failed to delete driver: ${error.message}`);
    }
  }
);
