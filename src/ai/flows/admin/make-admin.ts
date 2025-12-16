
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
 * This can only be run in a secure server environment (like a Genkit flow).
 * It now automatically makes the first user an admin.
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

      // Check if this is the first user signing up.
      const userList = await auth.listUsers(1);
      if (userList.users.length <= 1) {
        // This is the first user, so make them an admin automatically.
        await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
        console.log(`Successfully made the first user, ${email} (UID: ${user.uid}), an admin.`);
        return { message: `Success! As the first user, ${email} is now an admin. They must log out and log back in for the changes to take effect.` };
      }

      // For any subsequent user, this flow would require an existing admin to trigger it.
      // Since we haven't built that logic, we will just show a message.
      // In a real production scenario, you would add an authPolicy here to check
      // if the caller is an admin.
      return { message: `User ${email} was not made an admin. Only the first user is made an admin automatically.` };

    } catch (error: any) {
      console.error(`Error in makeAdmin flow for email: ${email}`, error);
      if (error.code === 'auth/user-not-found') {
        throw new Error(`No user found with email: ${email}`);
      }
      throw new Error('An unexpected error occurred while setting admin claim.');
    }
  }
);

    