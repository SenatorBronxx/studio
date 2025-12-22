'use server';
/**
 * @fileOverview A Cloud Function trigger that makes the first user an admin.
 *
 * - oncreateuser - A Firebase Function that triggers when a new user is created.
 */
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onUserCreate } from 'firebase-functions/v2/auth';

// --- Firebase Admin Initialization ---
// This must be done for the functions to have the necessary permissions to act.
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
  const user = event.data; // The user record created
  const db = getFirestore();
  const auth = getAuth();
  
  // A private document used solely to track the total number of users.
  const userCountRef = db.collection('_internal').doc('userCount');
  
  try {
    const userCountDoc = await userCountRef.get();

    // If the counter document doesn't exist, this is the first user.
    if (!userCountDoc.exists) {
      // Set the 'admin' custom claim on the user's token.
      await auth.setCustomUserClaims(user.uid, { admin: true });
      console.log(`First user ${user.email} created. Granted admin privileges.`);
      
      // Create the counter document to track subsequent users.
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
