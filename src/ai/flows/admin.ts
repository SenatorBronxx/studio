
'use server';
/**
 * @fileOverview A single file containing all admin-related backend flows for Eritas Gateway.
 *
 * This file includes functionality for:
 * - Granting admin privileges.
 * - Automatically making the first signed-up user an admin.
 * - Listing all users and drivers.
 * - Generating one-time registration codes for new drivers.
 * - Deleting user and driver accounts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onUserCreate } from 'firebase-functions/v2/auth';

// --- Firebase Admin Initialization ---
// This setup ensures Firebase Admin is initialized only once.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}


// --- 1. Make User Admin Flow ---

const MakeAdminInputSchema = z.object({
  email: z.string().email(),
});

const MakeAdminOutputSchema = z.object({
  message: z.string(),
});

export async function makeAdmin(
  input: z.infer<typeof MakeAdminInputSchema>
): Promise<z.infer<typeof MakeAdminOutputSchema>> {
  return makeAdminFlow(input);
}

const makeAdminFlow = ai.defineFlow(
  {
    name: 'makeAdminFlow',
    inputSchema: MakeAdminInputSchema,
    outputSchema: MakeAdminOutputSchema,
  },
  async ({ email }) => {
    try {
      const user = await getAuth().getUserByEmail(email);
      if (user.customClaims?.['admin'] === true) {
        return { message: `${email} is already an admin.` };
      }
      await getAuth().setCustomUserClaims(user.uid, { admin: true });
      return { message: `Successfully made ${email} an admin.` };
    } catch (error: any) {
      console.error('Error in makeAdminFlow:', error);
      throw new Error(error.code === 'auth/user-not-found' ? `User with email ${email} not found.` : `Failed to make user an admin: ${error.message}`);
    }
  }
);


// --- 2. On User Create Trigger (First User = Admin) ---

export const oncreateuser = onUserCreate(async (event) => {
  const user = event.data;
  const db = getFirestore();
  const auth = getAuth();
  const userCountRef = db.collection('_internal').doc('userCount');

  try {
    await db.runTransaction(async (transaction) => {
      const userCountDoc = await transaction.get(userCountRef);
      if (!userCountDoc.exists) {
        transaction.set(userCountRef, { count: 1 });
        await auth.setCustomUserClaims(user.uid, { admin: true });
        console.log(`First user ${user.email} created, granted admin privileges.`);
      } else {
        transaction.update(userCountRef, { count: FieldValue.increment(1) });
        console.log(`New user ${user.email} created. Total users: ${userCountDoc.data()?.count + 1}`);
      }
    });
  } catch (error) {
    console.error('Transaction to update user count failed: ', error);
  }
});


// --- 3. List Users Flow ---

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

export async function listUsers(): Promise<z.infer<typeof ListUsersOutputSchema>> {
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


// --- 4. Generate Driver Registration Code Flow ---

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


// --- 5. List Drivers Flow ---

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

export async function listDrivers(): Promise<z.infer<typeof ListDriversOutputSchema>> {
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


// --- 6. Delete User Flow ---

const DeleteUserInputSchema = z.object({
  userId: z.string().describe('The UID of the user to delete.'),
});

export async function deleteUser(
  input: z.infer<typeof DeleteUserInputSchema>
): Promise<{ success: boolean; message: string; }> {
  return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ userId }) => {
    if (!userId) {
      throw new Error('User ID is required.');
    }
    try {
      const db = getFirestore();
      await db.collection('users').doc(userId).collection('preferences').doc('user-prefs').delete();
      await db.collection('users').doc(userId).delete();
      await getAuth().deleteUser(userId);
      return {
        success: true,
        message: `User with ID ${userId} has been deleted.`,
      };
    } catch (error: any) {
      console.error(`Error deleting user ${userId}:`, error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
);


// --- 7. Delete Driver Flow ---

const DeleteDriverInputSchema = z.object({
  driverId: z.string().describe('The UID of the driver to delete.'),
});

export async function deleteDriver(
  input: z.infer<typeof DeleteDriverInputSchema>
): Promise<{ success: boolean; message: string; }> {
  return deleteDriverFlow(input);
}

const deleteDriverFlow = ai.defineFlow(
  {
    name: 'deleteDriverFlow',
    inputSchema: DeleteDriverInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ driverId }) => {
    if (!driverId) {
      throw new Error('Driver ID is required.');
    }
    try {
      const db = getFirestore();
      // Optional: Add deletion of sub-collections like 'earnings' if they exist
      // const earningsRef = db.collection('drivers').doc(driverId).collection('earnings');
      // const earningsSnapshot = await earningsRef.get();
      // const batch = db.batch();
      // earningsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      // await batch.commit();
      
      await db.collection('drivers').doc(driverId).delete();
      await getAuth().deleteUser(driverId);
      return {
        success: true,
        message: `Driver with ID ${driverId} has been deleted.`,
      };
    } catch (error: any) {
      console.error(`Error deleting driver ${driverId}:`, error);
      throw new Error(`Failed to delete driver: ${error.message}`);
    }
  }
);
