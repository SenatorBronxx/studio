
'use server';
/**
 * @fileOverview A flow for generating a one-time driver registration code and creating a driver profile.
 *
 * - generateDriverCode - Creates a driver profile and then a unique code for them.
 * - GenerateDriverCodeInput - The input type for the flow, containing driver credentials.
 * - GenerateDriverCodeOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';

const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  driversLicenseNumber: z.string().min(1, "Driver's license is required."),
  ghanaCardNumber: z.string().min(1, "Ghana Card number is required."),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

const GenerateDriverCodeOutputSchema = z.object({
  code: z.string().describe('The generated 6-character alphanumeric code.'),
  driverId: z.string().describe('The ID of the created driver profile document.'),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;


export async function generateDriverCode(input: GenerateDriverCodeInput): Promise<GenerateDriverCodeOutput> {
  return await generateDriverCodeFlow(input);
}

/**
 * Generates a random 6-character alphanumeric string.
 * @returns {string} The generated code.
 */
function createCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


const generateDriverCodeFlow = ai.defineFlow(
  {
    name: 'generateDriverCodeFlow',
    inputSchema: GenerateDriverCodeInputSchema,
    outputSchema: GenerateDriverCodeOutputSchema,
  },
  async (input) => {
    // We need to initialize a server-side Firebase instance to write to the database.
    const { firestore } = initializeFirebase();
    const driverId = uuidv4(); // Generate a unique ID for the new driver document
    const code = createCode();

    try {
        // 1. Create the permanent driver profile document first
        const driverRef = doc(firestore, 'drivers', driverId);
        await setDoc(driverRef, {
            id: driverId, // This ID is temporary until a user claims it
            ...input,
            registrationDate: new Date().toISOString(),
            // The registrationCode is stored here for reference, but the source of truth is the registrationCodes collection
            registrationCode: code,
        });

        // 2. Create the registration code document, linking it to the driver profile
        const codeRef = doc(firestore, 'registrationCodes', code);
        await setDoc(codeRef, {
            code: code,
            createdAt: serverTimestamp(),
            isUsed: false,
            usedBy: null,
            driverId: driverId, // Link code to the created driver profile
        });

        console.log(`Successfully created driver profile ${driverId} and registration code ${code}`);
        return { code, driverId };

    } catch (error) {
        console.error("Error creating driver profile and code:", error);
        throw new Error("Failed to create driver profile and registration code.");
    }
  }
);
