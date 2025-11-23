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

const SongInsightsOutputSchema = z.object({
  trivia: z.string().describe('Interesting trivia or background information about the song or artist.'),
  lyrics: z.string().describe('The full lyrics of the song.'),
});
export type SongInsightsOutput = z.infer<typeof SongInsightsOutputSchema>;


const MOCK_INSIGHTS: Record<string, SongInsightsOutput> = {
    "Adonai by Sarkodie": {
        trivia: "Sarkodie's 'Adonai' remix featuring Castro is one of the most successful Ghanaian songs of all time. The tragic disappearance of Castro at sea shortly after the song's release added a layer of poignancy and cemented its place in Ghanaian music history.",
        lyrics: `(Sarkodie)\nYeah! Uh!\nNow, lemme see you bounce!\nUh! OBIDIPONBIDI!\n\n(Castro)\nAdonai, Adonai, Nhyira nka wo din Adonai\n(Blessings be unto your name, Adonai)\nAyeyi nka wo din Adonai\n(Praises be unto your name, Adonai)\nMe nyankopon, me nyankopon\n(My God, my God)\nWo na wo ma me daa\n(You are the one who provides for me daily)\n\n(Sarkodie - Verse 1)\nEveryday I wake up, I thank the Lord for my life\nStarted from the bottom, now we here, we alright\nSee the blessings coming, man, I never give up the fight\nFrom the streets of Tema, now we shining so bright\n... (Lyrics continue)`
    },
    "Accra Night by E.L": {
        trivia: "E.L's 'Accra Night' is an ode to the vibrant and bustling nightlife of Ghana's capital. The song captures the energy of the city, from its busy streets to its lively clubs, and has become an anthem for many who love Accra's nocturnal scene.",
        lyrics: `(E.L)\nYeah, it's another Accra night\nCity lights shining so bright\nFeeling good, everything's right\nGonna party till the morning light\n\nFrom Osu to East Legon\nThe vibe is on, the party's strong\nEvery corner, there's a song\nThis is where I belong\n... (Lyrics continue)`
    }
};


export async function getSongInsights(
  input: SongInsightsInput
): Promise<SongInsightsOutput> {
  // This is a mock implementation.
  // In a real app, this would call the Genkit flow `songInsightsFlow`.
  console.log('Fetching mock insights for:', input);
  
  const key = `${input.title} by ${input.artist}`;
  const result = MOCK_INSIGHTS[key];

  if (result) {
    return Promise.resolve(result);
  }

  // Return a generic response if no mock is found
  return Promise.resolve({
    trivia: `No specific trivia available for ${input.title}. This song is a popular track in the Ghanaian music scene.`,
    lyrics: `Lyrics for ${input.title} by ${input.artist} are not available in this mock version.`
  });
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
        You are a music expert and historian. For the song "${title}" by "${artist}", provide the following:
        1.  A short, interesting piece of trivia or background about the song, the artist, or its impact on Ghanaian culture.
        2.  The full lyrics for the song.

        Format the output as JSON.
      `,
      model: 'googleai/gemini-2.5-flash',
      tools: [],
      output: {
        schema: SongInsightsOutputSchema,
      },
    });

    return llmResponse.output || { trivia: "Could not generate insights.", lyrics: "Could not find lyrics."};
  }
);
