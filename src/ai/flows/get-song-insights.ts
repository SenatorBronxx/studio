'use server';
/**
 * @fileOverview A flow for getting insights and lyrics for a song.
 *
 * - getSongInsights - A function that returns trivia and lyrics.
 * - SongInsightsInput - The input type for the getSongInsights function.
 * - SongInsightsOutput - The return type for the getSongInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SongInsightsInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The name of the artist.'),
});
export type SongInsightsInput = z.infer<typeof SongInsightsInputSchema>;

const LyricLineSchema = z.object({
  time: z.number().describe('The timestamp in seconds when this lyric line starts.'),
  line: z.string().describe('A single line of the song lyrics.'),
});

const SongInsightsOutputSchema = z.object({
  trivia: z.string().describe('Interesting trivia or background information about the song or artist.'),
  lyrics: z.array(LyricLineSchema).describe('The full timed lyrics of the song.'),
});
export type SongInsightsOutput = z.infer<typeof SongInsightsOutputSchema>;


export async function getSongInsights(
  input: SongInsightsInput
): Promise<SongInsightsOutput> {
  return await songInsightsFlow(input);
}

const songInsightsFlow = ai.defineFlow(
  {
    name: 'songInsightsFlow',
    inputSchema: SongInsightsInputSchema,
    outputSchema: SongInsightsOutputSchema,
  },
  async ({ title, artist }) => {
    const llmResponse = await ai.generate({
      prompt: `
        You are a music expert and historian specializing in Ghanaian music. For the song "${title}" by "${artist}", provide the following:
        1.  A short, interesting piece of trivia or background about the song, the artist, or its impact on Ghanaian culture.
        2.  The full lyrics for the song, with a time in seconds for each line.

        Format the output as JSON that strictly adheres to the output schema.
      `,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: SongInsightsOutputSchema,
      },
    });

    return llmResponse.output || { trivia: "Could not generate insights.", lyrics: []};
  }
);
