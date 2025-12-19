'use server';
/**
 * @fileOverview A consolidated file for all admin-related backend logic and Genkit flows.
 * This includes user and driver management, as well as permission handling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onUserCreate } from 'firebase-functions/v2/auth';

// --- Firebase Admin Initialization ---
// This must be done for the functions to have the necessary permissions.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}


//================================================================================
// 1. ON-CREATE-USER TRIGGER - Makes the first user an admin.
//================================================================================

/**
 * This Cloud Function is triggered whenever a new user is created in Firebase Authentication.
 * It checks if this is the very first user by looking for a special counter document in Firestore.
 * If it's the first user, it grants them an 'admin' custom claim.
 */
export const oncreateuser = onUserCreate(async (event) => {
  const user = event.data;
  const db = getFirestore();
  const auth = getAuth();
  
  // A private document used to track the total number of users.
  const userCountRef = db.collection('_internal').doc('userCount');
  
  try {
    const userCountDoc = await userCountRef.get();

    // If the counter document doesn't exist, this is the first user.
    if (!userCountDoc.exists) {
      // Set the 'admin' custom claim on the user's token.
      await auth.setCustomUserClaims(user.uid, { admin: true });
      console.log(`First user ${user.email} created. Granted admin privileges.`);
      
      // Create the counter document for subsequent users.
      await userCountRef.set({ count: 1 });
    } else {
      // If the document exists, just increment the counter.
      await userCountRef.update({ count: FieldValue.increment(1) });
      console.log(`New user ${user.email} created. Total users: ${userCountDoc.data()?.count + 1}`);
    }
  } catch (error) {
    console.error('Error in on-create-user trigger: ', error);
  }
});


//================================================================================
// 2. MAKE ADMIN FLOW
//================================================================================

const MakeAdminInputSchema = z.object({
  email: z.string().email(),
});
const MakeAdminOutputSchema = z.object({
  message: z.string(),
});
export type MakeAdminInput = z.infer<typeof MakeAdminInputSchema>;
export type MakeAdminOutput = z.infer<typeof MakeAdminOutputSchema>;

export async function makeAdmin(input: MakeAdminInput): Promise<MakeAdminOutput> {
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
      if (error.code === 'auth/user-not-found') {
        throw new Error(`User with email ${email} not found.`);
      }
      throw new Error(`Failed to make user an admin: ${error.message}`);
    }
  }
);


//================================================================================
// 3. GENERATE DRIVER CODE FLOW
//================================================================================

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
// 4. LIST USERS FLOW
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
// 5. LIST DRIVERS FLOW
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
// 6. DELETE USER FLOW
//================================================================================

const DeleteUserInputSchema = z.object({
  userId: z.string().describe('The UID of the user to delete.'),
});
const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;
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


//================================================================================
// 7. DELETE DRIVER FLOW
//================================================================================

const DeleteDriverInputSchema = z.object({
  driverId: z.string().describe('The UID of the driver to delete.'),
});
const DeleteDriverOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteDriverInput = z.infer<typeof DeleteDriverInputSchema>;
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
    if (!driverId) {
      throw new Error('Driver ID is required.');
    }
    try {
      const db = getFirestore();
      
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
