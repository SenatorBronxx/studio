
'use server';
/**
 * @fileOverview Firebase Auth trigger that runs when a new user is created.
 * It checks if the new user is the first user and grants admin privileges if so.
 */
import { onUserCreate } from 'firebase-functions/v2/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

export const oncreateuser = onUserCreate(async (event) => {
  const user = event.data;
  const db = getFirestore();
  const auth = getAuth();
  
  // This is a transaction to safely increment the user count
  // and check if this is the first user.
  const userCountRef = db.collection('_internal').doc('userCount');

  try {
    await db.runTransaction(async (transaction) => {
      const userCountDoc = await transaction.get(userCountRef);
      
      if (!userCountDoc.exists) {
        // This is the first user ever.
        transaction.set(userCountRef, { count: 1 });
        // Set custom claim 'admin' to true for the first user
        await auth.setCustomUserClaims(user.uid, { admin: true });
        console.log(`First user ${user.email} created, granted admin privileges.`);
      } else {
        // Not the first user, just increment the count.
        transaction.update(userCountRef, { count: FieldValue.increment(1) });
        console.log(`New user ${user.email} created. Total users: ${userCountDoc.data()?.count + 1}`);
      }
    });
  } catch (error) {
    console.error('Transaction to update user count failed: ', error);
  }
});
