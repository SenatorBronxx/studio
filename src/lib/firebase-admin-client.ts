'use client';
/**
 * @fileOverview Firebase client for an external admin web app.
 *
 * This file provides a simple way to initialize the Firebase client
 * for administrative tasks, connecting to the same backend as the
 * main passenger and driver applications.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * Initializes the Firebase application for the admin client.
 *
 * This function handles the singleton pattern for Firebase initialization,
 * ensuring it only runs once, and returns the Firestore service instance.
 *
 * @returns {{firebaseApp: FirebaseApp, firestore: Firestore}} An object containing the initialized Firebase app and Firestore instances.
 */
export function initializeAdminApp(): { firebaseApp: FirebaseApp; firestore: Firestore; } {
  let firebaseApp: FirebaseApp;

  // Check if any apps are already initialized
  if (!getApps().length) {
    // If not, initialize a new app with the shared configuration
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    // If an app is already initialized, get that instance
    firebaseApp = getApp();
  }

  // Get the Firestore service instance
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, firestore };
}
