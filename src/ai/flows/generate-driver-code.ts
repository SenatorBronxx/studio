'use server';
/**
 * @fileOverview A flow for generating a one-time registration code for a new driver.
 *
 * - generateDriverCode - Creates a new driver document with a unique code.
 * - GenerateDriverCodeInput - The input type for the flow.
 * - GenerateDriverCodeOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// --- Firebase Admin Initialization ---
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

// --- Input and Output Schemas ---
const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});

const GenerateDriverCodeOutputSchema = z.object({
  registrationCode: z.string(),
});

export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;


// --- Exported Flow Function ---
export async function generateDriverCode(input: GenerateDriverCodeInput): Promise<GenerateDriverCodeOutput> {
  return generateDriverCodeFlow(input);
}


// --- Genkit Flow Definition ---
const generateDriverCodeFlow = ai.defineFlow(
  {
    name: 'generateDriverCodeFlow',
    inputSchema: GenerateDriverCodeInputSchema,
    outputSchema: GenerateDriverCodeOutputSchema,
  },
  async (driverDetails) => {
    const db = getFirestore();
    // Generate a simple 6-digit code
    const registrationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const codeRef = db.collection('driverRegistrationCodes').doc(registrationCode);
    
    // Store the driver's details along with the code
    await codeRef.set({
      ...driverDetails,
      registrationCode,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { registrationCode };
  }
);
