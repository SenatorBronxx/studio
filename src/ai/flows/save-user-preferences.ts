'use server';
/**
 * @fileOverview Flow for saving user preferences.
 *
 * - saveUserPreferences - A function that handles saving user preferences.
 * - UserPreferencesInput - The input type for the saveUserPreferences function.
 * - UserPreferencesOutput - The return type for the saveUserPreferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserPreferencesInputSchema = z.object({
  food: z.string().describe("The user's favourite food."),
  music: z.string().describe("The user's favourite music."),
  destination: z.string().describe("The user's favourite Ghanaian destination."),
});
export type UserPreferencesInput = z.infer<typeof UserPreferencesInputSchema>;

const UserPreferencesOutputSchema = z.object({
  confirmationMessage: z.string().describe('A confirmation message for the user.'),
});
export type UserPreferencesOutput = z.infer<typeof UserPreferencesOutputSchema>;

export async function saveUserPreferences(
  input: UserPreferencesInput
): Promise<UserPreferencesOutput> {
  return saveUserPreferencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'saveUserPreferencesPrompt',
  input: {schema: UserPreferencesInputSchema},
  output: {schema: UserPreferencesOutputSchema},
  prompt: `You are a helpful assistant for Eritas Gateway, a bus booking app.

  A user has just provided their preferences.
  - Favourite Food: {{{food}}}
  - Favourite Music: {{{music}}}
  - Favourite Ghanaian Destination: {{{destination}}}

  Acknowledge that their preferences have been saved and write a short, friendly confirmation message.
  For example: "Thanks for sharing! We've saved your preferences."
  `,
});

const saveUserPreferencesFlow = ai.defineFlow(
  {
    name: 'saveUserPreferencesFlow',
    inputSchema: UserPreferencesInputSchema,
    outputSchema: UserPreferencesOutputSchema,
  },
  async input => {
    // In a real app, you would save this to a database.
    console.log('Saving user preferences:', input);

    const {output} = await prompt(input);
    return output!;
  }
);
