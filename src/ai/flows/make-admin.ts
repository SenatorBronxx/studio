'use server';
/**
 * @fileOverview A flow for granting a user admin privileges.
 *
 * - makeAdmin - Sets a custom claim on a user's Firebase Auth token.
 * - MakeAdminInput - The input type for the flow.
 * - MakeAdminOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// --- Firebase Admin Initialization ---
if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}


// --- Input and Output Schemas ---
const MakeAdminInputSchema = z.object({
  email: z.string().email(),
});

const MakeAdminOutputSchema = z.object({
  message: z.string(),
});

export type MakeAdminInput = z.infer<typeof MakeAdminInputSchema>;
export type MakeAdminOutput = z.infer<typeof MakeAdminOutputSchema>;


// --- Exported Flow Function ---
export async function makeAdmin(input: MakeAdminInput): Promise<MakeAdminOutput> {
  return makeAdminFlow(input);
}


// --- Genkit Flow Definition ---
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
      // Provide a user-friendly error message
      if (error.code === 'auth/user-not-found') {
        throw new Error(`User with email ${email} not found.`);
      }
      throw new Error(`Failed to make user an admin: ${error.message}`);
    }
  }
);
