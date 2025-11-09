'use server';
/**
 * @fileOverview Flow for generating personalized animation suggestions for the Eritas Gateway app.
 *
 * - personalizedAnimation - A function that generates animation suggestions.
 * - PersonalizedAnimationInput - The input type for the personalizedAnimation function.
 * - PersonalizedAnimationOutput - The return type for the personalizedAnimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAnimationInputSchema = z.object({
  interests: z
    .string()
    .describe('A comma-separated list of the user interests.'),
});
export type PersonalizedAnimationInput = z.infer<typeof PersonalizedAnimationInputSchema>;

const PersonalizedAnimationOutputSchema = z.object({
  stickerSuggestions: z
    .array(z.string())
    .describe(
      'An array of sticker suggestions based on the user interests.'
    ),
  animationStyle: z
    .string()
    .describe(
      'A description of an animation style that suits the user interests.'
    ),
});
export type PersonalizedAnimationOutput = z.infer<typeof PersonalizedAnimationOutputSchema>;

export async function personalizedAnimation(
  input: PersonalizedAnimationInput
): Promise<PersonalizedAnimationOutput> {
  return personalizedAnimationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedAnimationPrompt',
  input: {schema: PersonalizedAnimationInputSchema},
  output: {schema: PersonalizedAnimationOutputSchema},
  prompt: `You are a creative animation consultant for Eritas Gateway, a bus booking app.

  Based on the user's interests, suggest a list of animated stickers and an animation style to personalize their sign-in/sign-up experience.

  User Interests: {{{interests}}}

  Consider travel-related themes when suggesting stickers.
  Be creative and engaging.
  Always suggest at least three stickers.
  The animation style should also match the user interests.
  `,
});

const personalizedAnimationFlow = ai.defineFlow(
  {
    name: 'personalizedAnimationFlow',
    inputSchema: PersonalizedAnimationInputSchema,
    outputSchema: PersonalizedAnimationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
