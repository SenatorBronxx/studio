
'use server';
/**
 * @fileOverview A single file containing all backend logic for the Admin Panel.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
    GenerateDriverCodeInputSchema,
    type GenerateDriverCodeInput,
    GenerateDriverCodeOutputSchema,
    type GenerateDriverCodeOutput,
    ListUsersOutputSchema,
    type ListUsersOutput,
    ListDriversOutputSchema,
    type ListDriversOutput,
    DeleteUserInputSchema,
    type DeleteUserInput,
    DeleteUserOutputSchema,
    type DeleteUserOutput,
    DeleteDriverInputSchema,
    type DeleteDriverInput,
    DeleteDriverOutputSchema,
    type DeleteDriverOutput,
} from './admin-types';


// --- Firebase Admin Initialization ---
// Ensure Firebase is initialized only once.
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}


//================================================================================
// 1. GENERATE DRIVER REGISTRATION CODE
//================================================================================

export async function generateDriverCode(input: GenerateDriverCodeInput): Promise<GenerateDriverCodeOutput> {
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


//================================================================================
// 2. LIST USERS (PASSENGERS)
//================================================================================

export async function listUsers(): Promise<ListUsersOutput> {
  return listUsersFlow();
}

const listUsersFlow = ai.defineFlow(
  {
    name: 'listUsersFlow',
    inputSchema: z.void(),
    outputSchema: ListUsersOutputSchema,
  },
  async () => {
    const db = getFirestore();
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      return { users: [] };
    }

    const preferencesPromises = usersSnapshot.docs.map(doc =>
      db.collection('users').doc(doc.id).collection('preferences').doc('user-prefs').get()
    );
    
    const preferencesSnapshots = await Promise.all(preferencesPromises);

    const users = usersSnapshot.docs.map((userDoc, index) => {
      const userData = userDoc.data();
      const preferencesDoc = preferencesSnapshots[index];
      const preferencesData = preferencesDoc.exists ? preferencesDoc.data() : {};
      
      return {
        id: userDoc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        walletBalance: preferencesData?.walletBalance || 0,
      };
    });

    return { users };
  }
);


//================================================================================
// 3. LIST DRIVERS
//================================================================================

export async function listDrivers(): Promise<ListDriversOutput> {
  return listDriversFlow();
}

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
        registrationCode: data.registrationCode,
      };
    });

    return { drivers };
  }
);

//================================================================================
// 4. DELETE USER
//================================================================================

export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
    return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
    {
        name: 'deleteUserFlow',
        inputSchema: DeleteUserInputSchema,
        outputSchema: DeleteUserOutputSchema,
    },
    async ({ userId }) => {
        const auth = getAuth();
        const db = getFirestore();

        // Delete from Firebase Auth
        await auth.deleteUser(userId);

        // Delete from Firestore
        await db.collection('users').doc(userId).delete();

        return { message: `User ${userId} has been deleted successfully.` };
    }
);


//================================================================================
// 5. DELETE DRIVER
//================================================================================

export async function deleteDriver(input: DeleteDriverInput): Promise<DeleteDriverOutput> {
    return deleteDriverFlow(input);
}

const deleteDriverFlow = ai.defineFlow(
    {
        name: 'deleteDriverFlow',
        inputSchema: DeleteDriverInputSchema,
        outputSchema: DeleteDriverOutputSchema,
    },
    async ({ driverId }) => {
        const auth = getAuth();
        const db = getFirestore();

        // Delete from Firebase Auth
        await auth.deleteUser(driverId);

        // Delete from Firestore
        await db.collection('drivers').doc(driverId).delete();

        return { message: `Driver ${driverId} has been deleted successfully.` };
    }
);
