'use server';
/**
 * @fileOverview A flow for searching music using the Spotify API.
 *
 * - searchMusic - A function that handles searching for music.
 * - MusicSearchInput - The input type for the searchMusic function.
 * - MusicSearchOutput - The return type for the searchMusic function.
 */

import { z } from 'genkit';
import { searchTracks as searchSpotifyTracks } from '@/lib/spotify';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const fallbackImage = PlaceHolderImages.find(p => p.id === 'music-art-1')?.imageUrl || '';

const MusicSearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query for a song or artist.'),
});
export type MusicSearchInput = z.infer<typeof MusicSearchInputSchema>;

const TrackSchema = z.object({
  id: z.string().describe('A unique ID for the track from Spotify.'),
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The name of the artist.'),
  duration: z.string().describe('The duration of the song in MM:SS format.'),
  image: z.string().describe('URL for the cover art.'),
});

const MusicSearchOutputSchema = z.object({
  songs: z.array(TrackSchema).describe('An array of songs that match the query.'),
});
export type MusicSearchOutput = z.infer<typeof MusicSearchOutputSchema>;

// Helper to format milliseconds to MM:SS
const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;
};

export async function searchMusic(
  input: MusicSearchInput
): Promise<MusicSearchOutput> {
  if (!input.query) {
    return { songs: [] };
  }

  try {
    const spotifyResults = await searchSpotifyTracks(input.query, 10);

    const songs = spotifyResults.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      duration: formatDuration(track.duration_ms),
      image: track.album.images?.[0]?.url || fallbackImage,
    }));
    
    return { songs };

  } catch (error) {
    console.error("Error in searchMusic flow:", error);
    // In case of an error (e.g., API key issue), return an empty list.
    return { songs: [] };
  }
}
