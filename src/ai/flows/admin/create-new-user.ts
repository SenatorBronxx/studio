'use server';
/**
 * @fileOverview A flow for creating a new user and assigning admin rights to the first user.
 *
 * - createNewUser - Creates a user in Firebase Auth, creates their user document,
 *   and checks if they should be made an admin.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const CreateUserInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const CreateUserOutputSchema = z.object({
  uid: z.string(),
  email: z.string(),
  isAdmin: z.boolean(),
  message: z.string(),
});

/**
 * Creates a new user and makes them an admin if they are the first user.
 */
export const createNewUser = ai.defineFlow(
  {
    name: 'createNewUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async ({ firstName, lastName, email, password }) => {
    const auth = getAuth();
    const firestore = getFirestore();
    const fullName = `${firstName} ${lastName}`;
    let isAdmin = false;

    // 1. Check if any users already exist
    const usersCollection = firestore.collection('users');
    const existingUsersSnapshot = await usersCollection.limit(1).get();

    if (existingUsersSnapshot.empty) {
      // No users exist, this will be the first one.
      isAdmin = true;
    }

    // 2. Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: fullName,
    });

    const uid = userRecord.uid;

    // 3. Set custom claims if the user is an admin
    if (isAdmin) {
      await auth.setCustomUserClaims(uid, { admin: true });
      console.log(`First user signed up. Assigned admin role to ${email}.`);
    }

    // 4. Create the user document in Firestore
    const userDocRef = firestore.collection('users').doc(uid);
    const userData = {
      id: uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      signUpDate: Timestamp.now(),
      lastLogin: Timestamp.now(),
      profilePicture: userRecord.photoURL || '',
    };
    await userDocRef.set(userData);

    return {
      uid,
      email,
      isAdmin,
      message: `User ${fullName} created successfully. ${isAdmin ? 'Admin privileges granted.' : ''}`,
    };
  }
);
