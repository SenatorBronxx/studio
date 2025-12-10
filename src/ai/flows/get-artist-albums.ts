
'use server';
/**
 * @fileOverview A flow for getting an artist's albums and tracks from Spotify.
 *
 * - getArtistAlbums - Fetches artist details and their albums with tracks.
 * - ArtistAlbumInput - Input schema for the flow.
 * - ArtistAlbumOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getArtist, getArtistAlbums as getSpotifyArtistAlbums, getAlbumTracks } from '@/lib/spotify';

// Helper to format milliseconds to MM:SS
const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;
};


const ArtistAlbumInputSchema = z.object({
  artistId: z.string().describe('The Spotify ID of the artist.'),
});
export type ArtistAlbumInput = z.infer<typeof ArtistAlbumInputSchema>;

const ArtistInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    genres: z.array(z.string()),
});

const AlbumTrackSchema = z.object({
    id: z.string(),
    name: z.string(),
    duration: z.string(),
    artists: z.string(),
});
export type AlbumTrack = z.infer<typeof AlbumTrackSchema>;

const AlbumInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    releaseYear: z.string(),
    totalTracks: z.number(),
    tracks: z.array(AlbumTrackSchema),
});

const ArtistAlbumOutputSchema = z.object({
  artist: ArtistInfoSchema.nullable(),
  albums: z.array(AlbumInfoSchema),
});
export type ArtistAlbum = z.infer<typeof ArtistAlbumOutputSchema>;


export async function getArtistAlbums(
  input: ArtistAlbumInput
): Promise<ArtistAlbum> {
  return await getArtistAlbumsFlow(input);
}


const getArtistAlbumsFlow = ai.defineFlow(
  {
    name: 'getArtistAlbumsFlow',
    inputSchema: ArtistAlbumInputSchema,
    outputSchema: ArtistAlbumOutputSchema,
  },
  async ({ artistId }) => {
    try {
      const artistData = await getArtist(artistId);
      if (!artistData) {
        return { artist: null, albums: [] };
      }

      const artistInfo = {
        id: artistData.id,
        name: artistData.name,
        image: artistData.images?.[0]?.url || '',
        genres: artistData.genres || [],
      };
      
      const albumData = await getSpotifyArtistAlbums(artistId, 20);

      const albums = await Promise.all(albumData.map(async (album) => {
        const tracksData = await getAlbumTracks(album.id);
        const tracks: AlbumTrack[] = tracksData.map(track => ({
            id: track.id,
            name: track.name,
            duration: formatDuration(track.duration_ms),
            artists: track.artists.map((a: any) => a.name).join(', '),
        }));

        return {
            id: album.id,
            name: album.name,
            image: album.images?.[0]?.url || '',
            releaseYear: album.release_date.substring(0, 4),
            totalTracks: album.total_tracks,
            tracks: tracks,
        };
      }));

      return { artist: artistInfo, albums };

    } catch (error) {
      console.error("Error in getArtistAlbums flow:", error);
      return { artist: null, albums: [] };
    }
  }
);
