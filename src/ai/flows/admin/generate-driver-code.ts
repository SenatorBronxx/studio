
'use server';
/**
 * @fileOverview Flow for generating a one-time registration code for a new driver.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// --- Firebase Admin Initialization ---
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

// --- Schema Definitions ---

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


// --- Flow Export ---

export async function generateDriverCode(
  input: GenerateDriverCodeInput
): Promise<GenerateDriverCodeOutput> {
  return generateDriverCodeFlow(input);
}


// --- Flow Definition ---

const generateDriverCodeFlow = ai.defineFlow(
  {
    name: 'generateDriverCodeFlow',
    inputSchema: GenerateDriverCodeInputSchema,
    outputSchema: GenerateDriverCodeOutputSchema,
  },
  async (driverDetails) => {
    const db = getFirestore();
    
    // Generate a 6-digit code
    const registrationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const codeRef = db.collection('driverRegistrationCodes').doc(registrationCode);
    
    await codeRef.set({
      ...driverDetails,
      registrationCode,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { registrationCode };
  }
);
