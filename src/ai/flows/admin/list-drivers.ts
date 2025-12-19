
'use server';
/**
 * @fileOverview Flow for listing all registered drivers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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


// --- Flow Export ---

export async function listDrivers(): Promise<ListDriversOutput> {
  return listDriversFlow();
}


// --- Flow Definition ---

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

    const drivers = driversSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName,
        email: data.email,
        busPlateNumber: data.busPlateNumber,
        registrationCode: data.registrationCode, // Assuming this is stored on the driver doc after signup
      };
    });

    return { drivers };
  }
);
