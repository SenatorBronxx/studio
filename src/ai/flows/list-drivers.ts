'use server';
/**
 * @fileOverview A flow for listing all registered drivers.
 *
 * - listDrivers - Fetches and returns a list of all driver documents.
 * - ListDriversOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
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


// --- Output Schema ---
const DriverSchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  busPlateNumber: z.string().optional(),
  registrationCode: z.string().optional(),
});
const ListDriversOutputSchema = z.object({
  drivers: z.array(DriverSchema),
});

export type ListDriversOutput = z.infer<typeof ListDriversOutputSchema>;


// --- Exported Flow Function ---
export async function listDrivers(): Promise<ListDriversOutput> {
  return listDriversFlow();
}


// --- Genkit Flow Definition ---
const listDriversFlow = ai.defineFlow(
  {
    name: 'listDriversFlow',
    inputSchema: z.void(),
    outputSchema: ListDriversOutputSchema,
  },
  async () => {
    const db = getFirestore();
    const driversSnapshot = await db.collection('drivers').get();
    
    if (driversSnapshot.empty) {
      return { drivers: [] };
    }

    // Map the documents to the desired output schema
    const drivers = driversSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName,
        email: data.email,
        busPlateNumber: data.busPlateNumber,
        registrationCode: data.registrationCode,
      };
    });

    return { drivers };
  }
);
