
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
import { doc, getDocs, collection, query, where, limit, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

const RedeemDriverCodeInputSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters.").describe("The 6-digit code provided by the admin."),
  uid: z.string().describe("The Firebase UID of the user who is redeeming the code."),
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
    const codesQuery = query(collection(firestore, 'registrationCodes'), where("code", "==", code.toUpperCase()), limit(1));
    
    try {
      const codeQuerySnapshot = await getDocs(codesQuery);

      if (codeQuerySnapshot.empty) {
        return { success: false, message: "Invalid registration code." };
      }

      const codeDoc = codeQuerySnapshot.docs[0];
      const codeData = codeDoc.data();

      if (codeData.isUsed) {
        return { success: false, message: "This registration code has already been used." };
      }

      const driverId = codeData.driverId;
      if (!driverId) {
          return { success: false, message: "This code is not linked to a valid driver profile." };
      }

      // Use a batch write to perform multiple operations atomically
      const batch = writeBatch(firestore);

      // 1. Set the custom claim on the user to identify them as a driver
      await auth.setCustomUserClaims(uid, { driver: true });

      // 2. Mark the registration code as used and record who used it
      const codeRef = codeDoc.ref;
      batch.update(codeRef, {
        isUsed: true,
        redeemedBy: uid,
        redeemedAt: serverTimestamp(),
      });
      
      // 3. Update the permanent driver profile with the user's actual UID
      const driverRef = doc(firestore, 'drivers', driverId);
      batch.update(driverRef, {
          id: uid, 
      });

      // Commit all the changes at once
      await batch.commit();
      
      // It can take a moment for custom claims to propagate. The client app
      // should force a token refresh after this flow succeeds.
      console.log(`Successfully promoted user ${uid} to driver for profile ${driverId}`);
      return { success: true, message: "Registration successful! You are now registered as a driver." };

    } catch (error: any) {
      console.error("Error redeeming driver code:", error);
      return { success: false, message: error.message || "An unexpected error occurred during registration." };
    }
  }
);
