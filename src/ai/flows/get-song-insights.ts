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


const MOCK_INSIGHTS: Record<string, SongInsightsOutput> = {
    "Adonai by Sarkodie": {
        trivia: "Sarkodie's 'Adonai' remix featuring Castro is one of the most successful Ghanaian songs of all time. The tragic disappearance of Castro at sea shortly after the song's release added a layer of poignancy and cemented its place in Ghanaian music history.",
        lyrics: [
            { time: 0, line: "Yeah! Uh!" },
            { time: 3, line: "Now, lemme see you bounce!" },
            { time: 5, line: "Uh! OBIDIPONBIDI!" },
            { time: 8, line: "Adonai, Adonai, Nhyira nka wo din Adonai" },
            { time: 13, line: "(Blessings be unto your name, Adonai)" },
            { time: 16, line: "Ayeyi nka wo din Adonai" },
            { time: 20, line: "(Praises be unto your name, Adonai)" },
            { time: 23, line: "Me nyankopon, me nyankopon" },
            { time: 26, line: "(My God, my God)" },
            { time: 28, line: "Wo na wo ma me daa" },
            { time: 30, line: "(You are the one who provides for me daily)" },
            { time: 33, line: "Everyday I wake up, I thank the Lord for my life" },
            { time: 37, line: "Started from the bottom, now we here, we alright" },
            { time: 41, line: "See the blessings coming, man, I never give up the fight" },
            { time: 45, line: "From the streets of Tema, now we shining so bright" },
        ]
    },
    "Accra Night by E.L": {
        trivia: "E.L's 'Accra Night' is an ode to the vibrant and bustling nightlife of Ghana's capital. The song captures the energy of the city, from its busy streets to its lively clubs, and has become an anthem for many who love Accra's nocturnal scene.",
        lyrics: [
            { time: 0, line: "Yeah, it's another Accra night" },
            { time: 4, line: "City lights shining so bright" },
            { time: 8, line: "Feeling good, everything's right" },
            { time: 12, line: "Gonna party till the morning light" },
            { time: 16, line: "From Osu to East Legon" },
            { time: 20, line: "The vibe is on, the party's strong" },
            { time: 24, line: "Every corner, there's a song" },
            { time: 28, line: "This is where I belong" },
        ]
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
    lyrics: [{ time: 0, line: `Lyrics for ${input.title} by ${input.artist} are not available in this mock version.`}]
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
        2.  The full lyrics for the song, with a time in seconds for each line.

        Format the output as JSON.
      `,
      model: 'googleai/gemini-2.5-flash',
      tools: [],
      output: {
        schema: SongInsightsOutputSchema,
      },
    });

    return llmResponse.output || { trivia: "Could not generate insights.", lyrics: []};
  }
);
