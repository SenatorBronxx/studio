
'use server';
/**
 * @fileOverview A flow for redeeming a one-time driver registration code.
 *
 * - redeemDriverCode - Validates a code and promotes a user to a driver.
 * - RedeemDriverCodeInput - The input type for the flow.
 * - RedeemDriverCodeOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { getFirestore, doc, getDoc, updateDoc, writeBatch, getDocs, collection, query, where, limit } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

const RedeemDriverCodeInputSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters."),
  uid: z.string().describe("The UID of the user redeeming the code."),
});
export type RedeemDriverCodeInput = z.infer<typeof RedeemDriverCodeInputSchema>;

const RedeemDriverCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type RedeemDriverCodeOutput = z.infer<typeof RedeemDriverCodeOutputSchema>;

export async function redeemDriverCode(
  input: RedeemDriverCodeInput
): Promise<RedeemDriverCodeOutput> {
  return await redeemDriverCodeFlow(input);
}

const redeemDriverCodeFlow = ai.defineFlow(
  {
    name: 'redeemDriverCodeFlow',
    inputSchema: RedeemDriverCodeInputSchema,
    outputSchema: RedeemDriverCodeOutputSchema,
  },
  async ({ code, uid }) => {
    const { firestore, firebaseAdminApp } = initializeFirebase();
    const auth = getAuth(firebaseAdminApp);

    // Find the registration code document
    const codesQuery = query(collection(firestore, 'registrationCodes'), where("code", "==", code), limit(1));
    
    try {
      const codeQuerySnapshot = await getDocs(codesQuery);

      if (codeQuerySnapshot.empty) {
        return { success: false, message: "Invalid registration code." };
      }

      const codeDoc = codeQuerySnapshot.docs[0];
      const codeData = codeDoc.data();
      const codeRef = codeDoc.ref;

      if (codeData.isUsed) {
        return { success: false, message: "This registration code has already been used." };
      }

      const driverId = codeData.driverId;
      if (!driverId) {
          return { success: false, message: "Code is not linked to a driver profile." };
      }

      // Start a batch write to ensure atomicity
      const batch = writeBatch(firestore);

      // 1. Set the custom claim on the user
      await auth.setCustomUserClaims(uid, { driver: true });

      // 2. Mark the code as used
      batch.update(codeRef, {
        isUsed: true,
        usedBy: uid,
      });
      
      // 3. Update the driver profile with the actual user UID
      const driverRef = doc(firestore, 'drivers', driverId);
      batch.update(driverRef, {
          id: uid, // Replace the temporary ID with the user's actual UID
      });

      // Commit the atomic batch write
      await batch.commit();

      return { success: true, message: "Successfully registered as a driver." };

    } catch (error: any) {
      console.error("Error redeeming driver code:", error);
      return { success: false, message: error.message || "An unexpected error occurred." };
    }
  }
);
