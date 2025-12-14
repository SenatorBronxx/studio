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
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

const RedeemDriverCodeInputSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters."),
  uid: z.string().describe("The UID of the user redeeming the code."),
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  driversLicenseNumber: z.string().min(1, "Driver's license is required."),
  ghanaCardNumber: z.string().min(1, "Ghana Card number is required."),
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
  async (input) => {
    const { firestore, firebaseAdminApp } = initializeFirebase();
    const auth = getAuth(firebaseAdminApp);

    const codesRef = doc(firestore, 'registrationCodes', input.code);

    try {
      const codeDoc = await getDoc(codesRef);

      if (!codeDoc.exists() || codeDoc.data()?.isUsed) {
        return { success: false, message: "Invalid or already used registration code." };
      }

      // 1. Set the custom claim on the user
      await auth.setCustomUserClaims(input.uid, { driver: true });

      // 2. Mark the code as used
      await updateDoc(codesRef, {
        isUsed: true,
        usedBy: input.uid,
      });
      
      // 3. Create the permanent driver profile document
      const driverRef = doc(firestore, 'drivers', input.uid);
      await setDoc(driverRef, {
        id: input.uid,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        driversLicenseNumber: input.driversLicenseNumber,
        ghanaCardNumber: input.ghanaCardNumber,
        registrationCode: input.code,
        registrationDate: new Date().toISOString(),
      });

      return { success: true, message: "Successfully registered as a driver." };

    } catch (error: any) {
      console.error("Error redeeming driver code:", error);
      return { success: false, message: error.message || "An unexpected error occurred." };
    }
  }
);
