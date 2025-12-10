'use server';
/**
 * @fileOverview A flow for searching artists using the Spotify API.
 *
 * - searchArtists - A function that handles searching for artists.
 * - ArtistSearchInput - The input type for the searchArtists function.
 * - ArtistSearchOutput - The return type for the searchArtists function.
 */

import { z } from 'genkit';
import { searchArtists as searchSpotifyArtists } from '@/lib/spotify';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ai } from '@/ai/genkit';

const fallbackImage = PlaceHolderImages.find(p => p.id === 'user-avatar')?.imageUrl || '';

const ArtistSearchInputSchema = z.object({
  queries: z.array(z.string()).describe('An array of artist names to search for.'),
});
export type ArtistSearchInput = z.infer<typeof ArtistSearchInputSchema>;

const ArtistSchema = z.object({
  id: z.string().describe('A unique ID for the artist from Spotify.'),
  name: z.string().describe('The name of the artist.'),
  image: z.string().describe('URL for the artist\'s image.'),
});
export type Artist = z.infer<typeof ArtistSchema>;

const ArtistSearchOutputSchema = z.object({
  artists: z.array(ArtistSchema).describe('An array of artists that were found.'),
});
export type ArtistSearchOutput = z.infer<typeof ArtistSearchOutputSchema>;


export async function searchArtists(
  input: ArtistSearchInput
): Promise<ArtistSearchOutput> {
  return await searchArtistsFlow(input);
}


const searchArtistsFlow = ai.defineFlow(
  {
    name: 'searchArtistsFlow',
    inputSchema: ArtistSearchInputSchema,
    outputSchema: ArtistSearchOutputSchema,
  },
  async ({ queries }) => {
    if (!queries || queries.length === 0) {
      return { artists: [] };
    }

    try {
      // Perform searches for all artists in parallel
      const searchPromises = queries.map(query => searchSpotifyArtists(query, 1));
      const results = await Promise.all(searchPromises);
      
      const artists: Artist[] = results.map((artistResults, index) => {
        const artist = artistResults[0]; // Get the first result for each query
        if (artist) {
            return {
                id: artist.id,
                name: artist.name,
                image: artist.images?.[0]?.url || fallbackImage,
            };
        }
        // If no artist is found, return a placeholder
        return {
            id: `not-found-${index}`,
            name: queries[index],
            image: fallbackImage
        }
      }).filter(artist => artist !== null) as Artist[];

      return { artists };

    } catch (error) {
      console.error("Error in searchArtists flow:", error);
      return { artists: [] };
    }
  }
);
