
'use server';
/**
 * @fileOverview Flow for granting admin privileges to a user by email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// --- Firebase Admin Initialization ---
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

// --- Schema Definitions ---

const MakeAdminInputSchema = z.object({
  email: z.string().email(),
});

const MakeAdminOutputSchema = z.object({
  message: z.string(),
});

export type MakeAdminInput = z.infer<typeof MakeAdminInputSchema>;
export type MakeAdminOutput = z.infer<typeof MakeAdminOutputSchema>;

// --- Flow Export ---

export async function makeAdmin(
  input: MakeAdminInput
): Promise<MakeAdminOutput> {
  return makeAdminFlow(input);
}

// --- Flow Definition ---

const makeAdminFlow = ai.defineFlow(
  {
    name: 'makeAdminFlow',
    inputSchema: MakeAdminInputSchema,
    outputSchema: MakeAdminOutputSchema,
  },
  async ({ email }) => {
    try {
      const user = await getAuth().getUserByEmail(email);

      // Check if the user is already an admin
      if (user.customClaims?.['admin'] === true) {
        return { message: `${email} is already an admin.` };
      }

      // Set the custom claim
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
