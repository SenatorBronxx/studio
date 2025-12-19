
'use server';
/**
 * @fileOverview A Firebase Function trigger that automatically makes the first registered user an admin.
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onUserCreate } from 'firebase-functions/v2/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// --- Firebase Admin Initialization ---
// This must be done for the function to have the necessary permissions.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

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
