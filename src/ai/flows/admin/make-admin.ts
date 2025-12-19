
'use server';
/**
 * @fileOverview A flow for granting admin privileges to a user.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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

const MakeAdminInputSchema = z.object({
  email: z.string().email(),
});

const MakeAdminOutputSchema = z.object({
  message: z.string(),
});

export async function makeAdmin(
  input: z.infer<typeof MakeAdminInputSchema>
): Promise<z.infer<typeof MakeAdminOutputSchema>> {
  return makeAdminFlow(input);
}

const makeAdminFlow = ai.defineFlow(
  {
    name: 'makeAdminFlow',
    inputSchema: MakeAdminInputSchema,
    outputSchema: MakeAdminOutputSchema,
  },
  async ({ email }) => {
    try {
      const user = await getAuth().getUserByEmail(email);
      if (!user) {
        throw new Error(`User with email ${email} not found.`);
      }

      // Check if user is already an admin
      if (user.customClaims?.['admin'] === true) {
        return { message: `${email} is already an admin.` };
      }

      // Set the custom claim 'admin' to true
      await getAuth().setCustomUserClaims(user.uid, { admin: true });

      return { message: `Successfully made ${email} an admin.` };
    } catch (error: any) {
      console.error('Error in makeAdminFlow:', error);
      throw new Error(`Failed to make user an admin: ${error.message}`);
    }
  }
);
