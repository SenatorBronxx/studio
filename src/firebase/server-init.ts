/**
 * @fileOverview Server-side Firebase initialization.
 *
 * This file provides a singleton pattern for initializing the Firebase Admin SDK
 * on the server. It should only be used in server environments (e.g., Genkit flows,
 * Next.js server actions).
 */

import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config'; // Using the same client config for project details

// IMPORTANT: Service account credentials should be handled via environment variables
// as configured in your hosting environment (e.g., Google Cloud Run).
// Do not hardcode credentials in the source code.

let firebaseAdminApp: App;
let firestore: Firestore;

/**
 * Initializes the Firebase Admin SDK.
 *
 * Ensures that initialization only happens once.
 * @returns An object containing the initialized Firebase Admin app and Firestore instances.
 */
export function initializeFirebase(): { firebaseAdminApp: App; firestore: Firestore; } {
  if (!getApps().length) {
    // If no app is initialized, create a new one.
    // The SDK will automatically look for GOOGLE_APPLICATION_CREDENTIALS env var.
    firebaseAdminApp = initializeApp({
        projectId: firebaseConfig.projectId,
    });
    console.log("Firebase Admin SDK initialized.");
  } else {
    // If an app is already initialized, get that instance.
    firebaseAdminApp = getApp();
  }

  firestore = getFirestore(firebaseAdminApp);

  return { firebaseAdminApp, firestore };
}
