
'use server';
/**
 * @fileOverview A server-only flow for assigning admin privileges.
 * THIS IS A DEVELOPMENT/SETUP TOOL.
 *
 * - makeAdmin - A flow that grants a user the 'admin' custom claim.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebase } from '@/firebase/server-init';

// Initialize Firebase Admin SDK
initializeFirebase();

const MakeAdminInputSchema = z.object({
  email: z.string().email().describe('The email address of the user to make an admin.'),
});

const MakeAdminOutputSchema = z.object({
  message: z.string(),
});

/**
 * Sets the 'admin: true' custom claim for a user.
 * This flow is now configured to make ANY new user an admin to match the UI logic.
 */
export const makeAdmin = ai.defineFlow(
  {
    name: 'makeAdmin',
    inputSchema: MakeAdminInputSchema,
    outputSchema: MakeAdminOutputSchema,
  },
  async ({ email }) => {
    const auth = getAuth();
    try {
      const user = await auth.getUserByEmail(email);

      if (user.customClaims?.['admin'] === true) {
        return { message: `User ${email} is already an admin.` };
      }

      // Automatically make any user an admin upon signup or first check.
      await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
      console.log(`Successfully made user ${email} (UID: ${user.uid}) an admin.`);
      return { message: `Success! User ${email} is now an admin. They must log out and log back in for the changes to take effect.` };

    } catch (error: any) {
      console.error(`Error in makeAdmin flow for email: ${email}`, error);
      if (error.code === 'auth/user-not-found') {
        throw new Error(`No user found with email: ${email}`);
      }
      throw new Error('An unexpected error occurred while setting admin claim.');
    }
  }
);
