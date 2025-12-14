
'use server';
/**
 * @fileOverview A flow for an admin to create a new driver profile and generate a one-time registration code.
 *
 * - generateDriverCode - Creates a Firestore profile and a registration code.
 * - GenerateDriverCodeInput - The input type for the flow, containing all driver credentials.
 * - GenerateDriverCodeOutput - The return type for the flow, containing the generated code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  driversLicenseNumber: z.string().min(1, "Driver's license is required."),
  ghanaCardNumber: z.string().min(1, "Ghana Card number is required."),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

const GenerateDriverCodeOutputSchema = z.object({
  code: z.string().describe("The 6-digit one-time registration code for the driver."),
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
    const { firestore } = initializeFirebase();

    try {
        // 1. Create the permanent driver profile document in Firestore first.
        // The `id` field will be updated later when the driver redeems the code.
        const driverDocRef = await addDoc(collection(firestore, 'drivers'), {
            ...input,
            registrationDate: serverTimestamp(),
        });
        
        // 2. Generate a unique 6-digit alphanumeric code.
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // 3. Create the registration code document, linking it to the new driver profile.
        await addDoc(collection(firestore, 'registrationCodes'), {
            code: code,
            driverId: driverDocRef.id,
            isUsed: false,
            createdAt: serverTimestamp(),
        });

        console.log(`Successfully created driver profile and registration code for driver ${driverDocRef.id}`);
        return { code };

    } catch (error: any) {
        console.error("Error creating driver code:", error);
        throw new Error("Failed to generate the new driver registration code.");
    }
  }
);
