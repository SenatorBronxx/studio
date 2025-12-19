
'use server';
/**
 * @fileOverview A flow for generating a one-time registration code for a new driver.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { serverTimestamp } from 'firebase/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

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

export async function generateDriverCode(
  input: z.infer<typeof GenerateDriverCodeInputSchema>
): Promise<z.infer<typeof GenerateDriverCodeOutputSchema>> {
  return generateDriverCodeFlow(input);
}

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
    
    // Store the driver's details temporarily, linked to the code
    await codeRef.set({
      ...driverDetails,
      registrationCode,
      createdAt: serverTimestamp(),
    });

    return { registrationCode };
  }
);
