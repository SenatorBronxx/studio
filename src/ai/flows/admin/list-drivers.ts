
'use server';
/**
 * @fileOverview A flow for admins to list all drivers.
 *
 * - listDrivers - Retrieves a list of all driver profiles from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const DriverSchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  licenseNumber: z.string().optional(),
  ghanaCardNumber: z.string().optional(),
  busPlateNumber: z.string().optional(),
  registrationCode: z.string().optional(),
  createdAt: z.string().optional(),
});

const ListDriversOutputSchema = z.object({
  drivers: z.array(DriverSchema),
});

export const listDrivers = ai.defineFlow(
  {
    name: 'listDriversFlow',
    inputSchema: z.void(),
    outputSchema: ListDriversOutputSchema,
    authPolicy: (auth, input) => {
        if (!auth) {
            throw new Error("Authorization failed: No user authenticated.");
        }
        if (auth.customClaims?.admin !== true) {
          throw new Error("Authorization failed: User is not an admin.");
        }
    }
  },
  async () => {
    const firestore = getFirestore();
    const driversSnapshot = await firestore.collection('drivers').get();
    
    const drivers = driversSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'N/A',
        email: data.email || 'N/A',
        licenseNumber: data.licenseNumber || 'N/A',
        ghanaCardNumber: data.ghanaCardNumber || 'N/A',
        busPlateNumber: data.busPlateNumber || 'N/A',
        registrationCode: data.registrationCode || 'N/A',
        createdAt: data.createdAt?.toDate?.().toISOString() || 'N/A',
      };
    });

    return { drivers };
  }
);
