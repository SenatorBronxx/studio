
'use server';
/**
 * @fileOverview A flow for an admin to create a new driver, including their auth credentials and profile.
 *
 * - generateDriverCode - Creates a Firebase auth user, sets their driver claim, and creates their Firestore profile.
 * - GenerateDriverCodeInput - The input type for the flow, containing all driver credentials.
 * - GenerateDriverCodeOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  driversLicenseNumber: z.string().min(1, "Driver's license is required."),
  ghanaCardNumber: z.string().min(1, "Ghana Card number is required."),
  email: z.string().email("A valid email is required for the driver's login."),
  password: z.string().min(8, "A temporary password of at least 8 characters is required."),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

const GenerateDriverCodeOutputSchema = z.object({
  uid: z.string().describe("The new driver's Firebase Auth User ID."),
  email: z.string().describe("The driver's email, for confirmation."),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;


export async function generateDriverCode(input: GenerateDriverCodeInput): Promise<GenerateDriverCodeOutput> {
  return await generateDriverCodeFlow(input);
}


const generateDriverCodeFlow = ai.defineFlow(
  {
    name: 'generateDriverCodeFlow',
    inputSchema: GenerateDriverCodeInputSchema,
    outputSchema: GenerateDriverCodeOutputSchema,
  },
  async (input) => {
    const { firebaseAdminApp, firestore } = initializeFirebase();
    const auth = getAuth(firebaseAdminApp);

    try {
        // 1. Create the new user in Firebase Authentication
        const userRecord = await auth.createUser({
            email: input.email,
            password: input.password,
            displayName: input.fullName,
        });
        
        const uid = userRecord.uid;

        // 2. Set the custom claim to identify this user as a driver
        await auth.setCustomUserClaims(uid, { driver: true });

        // 3. Create the permanent driver profile document in Firestore
        const driverRef = doc(firestore, 'drivers', uid);
        await setDoc(driverRef, {
            id: uid,
            fullName: input.fullName,
            phoneNumber: input.phoneNumber,
            driversLicenseNumber: input.driversLicenseNumber,
            ghanaCardNumber: input.ghanaCardNumber,
            // Do not store the password or code here. Auth handles that.
            registrationDate: new Date().toISOString(),
        });

        console.log(`Successfully created driver auth account and profile for ${uid}`);
        return { uid, email: input.email };

    } catch (error: any) {
        console.error("Error creating driver:", error);
        // Provide a more specific error message if it's a known auth error code
        if (error.code === 'auth/email-already-exists') {
            throw new Error("This email address is already in use by another account.");
        }
        throw new Error("Failed to create the new driver.");
    }
  }
);
