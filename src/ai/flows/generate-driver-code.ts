
'use server';
/**
 * @fileOverview A flow for generating a one-time driver registration code.
 *
 * - generateDriverCode - Creates and stores a unique code in Firestore.
 * - GenerateDriverCodeOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const GenerateDriverCodeOutputSchema = z.object({
  code: z.string().describe('The generated 6-character alphanumeric code.'),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;


export async function generateDriverCode(): Promise<GenerateDriverCodeOutput> {
  return await generateDriverCodeFlow();
}

/**
 * Generates a random 6-character alphanumeric string.
 * @returns {string} The generated code.
 */
function createCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


const generateDriverCodeFlow = ai.defineFlow(
  {
    name: 'generateDriverCodeFlow',
    inputSchema: z.void(),
    outputSchema: GenerateDriverCodeOutputSchema,
  },
  async () => {
    // We need to initialize a server-side Firebase instance to write to the database.
    const { firestore } = initializeFirebase();

    const code = createCode();
    
    const codeData = {
        code: code,
        createdAt: serverTimestamp(),
        isUsed: false,
        usedBy: null
    };

    try {
        const docRef = await addDoc(collection(firestore, 'registrationCodes'), codeData);
        console.log("Successfully created registration code document with ID: ", docRef.id);
        return { code };
    } catch (error) {
        console.error("Error creating registration code:", error);
        throw new Error("Failed to create and store a registration code.");
    }
  }
);
