'use server';
/**
 * @fileOverview A flow for searching music.
 *
 * - searchMusic - A function that handles searching for music.
 * - MusicSearchInput - The input type for the searchMusic function.
 * - MusicSearchOutput - The return type for the searchMusic function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const fallbackImage = PlaceHolderImages.find(p => p.id === 'music-art-1')?.imageUrl || '';

const MusicSearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query for a song or artist.'),
});
export type MusicSearchInput = z.infer<typeof MusicSearchInputSchema>;

const TrackSchema = z.object({
  id: z.number().describe('A unique ID for the track.'),
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The name of the artist.'),
  duration: z.string().describe('The duration of the song in MM:SS format.'),
  imageDescription: z.string().describe('A brief, visually descriptive prompt for generating cover art for this song. E.g., "A lone astronaut floating in space"'),
});

const MusicSearchOutputSchema = z.object({
  songs: z.array(TrackSchema).describe('An array of songs that match the query.'),
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
  async ({ query }) => {
    const prompt = `
      You are a music search engine. A user is searching for "{{query}}".
      Return a list of 5-10 songs that match this query.
      For each song, provide a unique ID, the title, artist, duration, and a creative image description for the cover art.
      Ensure the duration is in a realistic MM:SS format.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash',
      tools: [],
      output: {
        schema: MusicSearchOutputSchema,
      },
    });

    const songs = llmResponse.output()?.songs || [];
    
    // We are not generating images to avoid billing errors, but the description is ready.
    const songsWithPlaceholders = songs.map(song => ({
        ...song,
        image: fallbackImage 
    }));

    return { songs: songsWithPlaceholders };
  }
);
