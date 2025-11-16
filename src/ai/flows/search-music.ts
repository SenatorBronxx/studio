
'use server';
/**
 * @fileOverview A flow for searching for music.
 *
 * - searchMusic - A function that handles searching for music.
 * - MusicSearchInput - The input type for the searchMusic function.
 * - MusicSearchOutput - The return type for the searchMusic function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MusicSearchInputSchema = z.string();
export type MusicSearchInput = z.infer<typeof MusicSearchInputSchema>;

const SongSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
  duration: z.string().describe('The duration of the song in mm:ss format.'),
  image: z.string().describe("A data URI of a generated image for the song's cover art."),
});

const MusicSearchOutputSchema = z.object({
  songs: z.array(SongSchema).describe('A list of songs matching the query.'),
});
export type MusicSearchOutput = z.infer<typeof MusicSearchOutputSchema>;

export async function searchMusic(
  input: MusicSearchInput
): Promise<MusicSearchOutput> {
  return searchMusicFlow(input);
}

const searchMusicFlow = ai.defineFlow(
  {
    name: 'searchMusicFlow',
    inputSchema: MusicSearchInputSchema,
    outputSchema: MusicSearchOutputSchema,
  },
  async (query) => {
    const prompt = `You are a music search engine. Find 5 songs that match the query: "${query}".
    For each song, provide the title, artist, and a duration.
    Also, for each song, generate a compelling and abstract image description for its cover art. The description should be suitable for an image generation model.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'gemini-2.5-flash',
      tools: [],
      output: {
        schema: z.object({
          songs: z.array(
            z.object({
              title: z.string(),
              artist: z.string(),
              duration: z.string(),
              imageDescription: z.string(),
            })
          ),
        }),
      },
    });

    const songs = llmResponse.output?.songs || [];

    const imagePromises = songs.map(async (song) => {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A vibrant, abstract cover art for a song titled "${song.title}". Style: ${song.imageDescription}`,
      });
      return {
        ...song,
        image: media.url!,
      };
    });

    const songsWithImages = await Promise.all(imagePromises);

    return { songs: songsWithImages };
  }
);

    