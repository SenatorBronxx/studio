'use server';
/**
 * @fileOverview A single file containing all backend logic for the Admin Panel.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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

const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

const GenerateDriverCodeOutputSchema = z.object({
  registrationCode: z.string(),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;


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

const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  walletBalance: z.number().optional(),
});

const ListUsersOutputSchema = z.object({
  users: z.array(UserSchema),
});
export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;

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

const DeleteUserInputSchema = z.object({
  userId: z.string(),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const DeleteUserOutputSchema = z.object({
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;

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

const DeleteDriverInputSchema = z.object({
  driverId: z.string(),
});
export type DeleteDriverInput = z.infer<typeof DeleteDriverInputSchema>;

const DeleteDriverOutputSchema = z.object({
  message: z.string(),
});
export type DeleteDriverOutput = z.infer<typeof DeleteDriverOutputSchema>;

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
