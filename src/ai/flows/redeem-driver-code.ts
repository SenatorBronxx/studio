
'use server';
/**
 * @fileOverview A flow for redeeming a driver registration code.
 *
 * - redeemDriverCode - Verifies a code and creates a driver profile.
 * - RedeemCodeInput - Input schema for the flow.
 * - RedeemCodeOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';

const RedeemCodeInputSchema = z.object({
  uid: z.string().describe("The user's Firebase UID."),
  code: z.string().length(6, 'Code must be 6 characters.'),
  fullName: z.string().min(3, 'Full name is required.'),
  phoneNumber: z.string().min(10, 'Phone number is required.'),
  licenseNumber: z.string().min(5, 'License number is required.'),
  busPlateNumber: z.string().min(4, 'Bus plate number is required.'),
});
export type RedeemCodeInput = z.infer<typeof RedeemCodeInputSchema>;

const RedeemCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  driverId: z.string().optional(),
});
export type RedeemCodeOutput = z.infer<typeof RedeemCodeOutputSchema>;


export async function redeemDriverCode(
  input: RedeemCodeInput
): Promise<RedeemCodeOutput> {
  return await redeemDriverCodeFlow(input);
}


const redeemDriverCodeFlow = ai.defineFlow(
  {
    name: 'redeemDriverCodeFlow',
    inputSchema: RedeemCodeInputSchema,
    outputSchema: RedeemCodeOutputSchema,
  },
  async (input) => {
    const { firestore, firebaseAdminApp } = initializeFirebase();
    const { uid, code, fullName, phoneNumber, licenseNumber, busPlateNumber } = input;

    const codeRef = firestore.collection('registrationCodes').doc(code);
    const driverRef = firestore.collection('drivers').doc(uid);

    return await firestore.runTransaction(async (transaction) => {
      const codeDoc = await transaction.get(codeRef);

      if (!codeDoc.exists) {
        return { success: false, message: 'Invalid registration code.' };
      }

      const codeData = codeDoc.data();
      if (codeData?.isRedeemed) {
        return { success: false, message: 'This code has already been used.' };
      }
      
      // 1. Create the driver document
      transaction.set(driverRef, {
        uid,
        fullName,
        phoneNumber,
        licenseNumber,
        busPlateNumber,
        status: 'active',
        createdAt: Timestamp.now(),
      });

      // 2. Mark the code as redeemed
      transaction.update(codeRef, {
        isRedeemed: true,
        redeemedAt: Timestamp.now(),
        redeemedBy: uid,
      });
      
      // 3. Set custom claim on the user
      try {
        await getAuth(firebaseAdminApp).setCustomUserClaims(uid, { driver: true });
      } catch (error) {
        console.error("Error setting custom claims:", error);
        // This is a critical failure, so we should indicate the process failed.
        // The transaction will be rolled back automatically if we throw an error.
        throw new Error("Could not set user role. Please contact support.");
      }

      return { success: true, message: 'Registration successful! You are now a registered driver.', driverId: uid };
    }).catch((error: Error) => {
        console.error("Transaction failed: ", error);
        return { success: false, message: error.message || "An unexpected error occurred during registration." };
    });
  }
);
