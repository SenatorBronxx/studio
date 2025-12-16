
'use server';
/**
 * @fileOverview A flow for admins to generate a new driver and a registration code.
 *
 * - generateDriverCode - Creates a new driver auth account, a driver data document,
 *   a registration code document, and returns the 6-digit code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const GenerateDriverInputSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required for the driver\'s account.'),
  password: z.string().min(8, 'A secure password of at least 8 characters is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  assignedBus: z.string().optional(),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});

const GenerateDriverOutputSchema = z.object({
  driverId: z.string(),
  registrationCode: z.string(),
  message: z.string(),
});

export const generateDriverCode = ai.defineFlow(
  {
    name: 'generateDriverCodeFlow',
    inputSchema: GenerateDriverInputSchema,
    outputSchema: GenerateDriverOutputSchema,
    authPolicy: (auth, input) => {
        // This is a placeholder for a real auth check.
        // In a real app, you would verify the caller is an admin.
        if (!auth) {
            throw new Error("Authorization failed: No user authenticated.");
        }
        // A real implementation would check for an admin claim like this:
        // if (auth.customClaims?.admin !== true) {
        //   throw new Error("Authorization failed: User is not an admin.");
        // }
    }
  },
  async (driverInfo) => {
    const auth = getAuth();
    const firestore = getFirestore();

    // 1. Create a new user account in Firebase Auth for the driver
    const userRecord = await auth.createUser({
      email: driverInfo.email,
      password: driverInfo.password,
      displayName: driverInfo.fullName,
    });
    
    // 2. Set custom claims to identify this user as a 'driver'
    await auth.setCustomUserClaims(userRecord.uid, { driver: true });

    // 3. Generate a 6-digit numeric code
    const registrationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const driverId = userRecord.uid;
    const batch = firestore.batch();

    // 4. Create the driver's profile document in /drivers/{driverId}
    const driverRef = firestore.collection('drivers').doc(driverId);
    const driverData = {
        id: driverId,
        fullName: driverInfo.fullName,
        email: driverInfo.email,
        licenseNumber: driverInfo.licenseNumber,
        ghanaCardNumber: driverInfo.ghanaCardNumber,
        assignedBus: driverInfo.assignedBus || 'N/A',
        busPlateNumber: driverInfo.busPlateNumber,
        registrationCode: registrationCode,
        createdAt: Timestamp.now(),
    };
    batch.set(driverRef, driverData);

    // 5. Create the registration code document in /registrationCodes/{code}
    const codeRef = firestore.collection('registrationCodes').doc(registrationCode);
    const codeData = {
        code: registrationCode,
        driverId: driverId,
        isClaimed: false,
        createdAt: Timestamp.now(),
    };
    batch.set(codeRef, codeData);

    // Commit both writes at once
    await batch.commit();

    console.log(`Successfully created driver ${driverInfo.fullName} with code ${registrationCode}`);

    return {
      driverId: driverId,
      registrationCode: registrationCode,
      message: `Successfully created driver ${driverInfo.fullName}. Their registration code is ${registrationCode}.`,
    };
  }
);
