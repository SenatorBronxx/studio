
'use server';
/**
 * @fileOverview An AI flow to get music recommendations based on user preferences.
 *
 * - getRecommendations - A function that fetches song recommendations.
 * - GetRecommendationsInput - The input type for the getRecommendations function.
 * - GetRecommendationsOutput - The return type for the getRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchTracks } from '@/lib/spotify';

const GetRecommendationsInputSchema = z.object({
  favoriteMusic: z.string().describe('The user\'s stated favorite music genre or style, e.g., "Highlife" or "90s hip-hop".'),
});
export type GetRecommendationsInput = z.infer<typeof GetRecommendationsInputSchema>;

// We don't need a strict output schema for the flow itself,
// as the final transformation to Track[] happens in the exported function.
const GetRecommendationsOutputSchema = z.object({
    recommendations: z.array(z.any()).describe("An array of recommended Spotify track objects."),
});
export type GetRecommendationsOutput = z.infer<typeof GetRecommendationsOutputSchema>;


const recommendationTool = ai.defineTool(
    {
        name: 'getMusicRecommendations',
        description: 'Gets a list of songs from Spotify based on a search query.',
        inputSchema: z.object({
            queries: z.array(z.string()).describe('An array of 3 diverse search queries based on the user\'s favorite music.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => {
        const results = await Promise.all(
            input.queries.map(q => searchTracks(q, 5))
        );
        // Flatten the array of arrays and return
        return results.flat();
    }
);


const getRecommendationsFlow = ai.defineFlow(
    {
        name: 'getRecommendationsFlow',
        inputSchema: GetRecommendationsInputSchema,
        outputSchema: GetRecommendationsOutputSchema,
    },
    async (input) => {
        const llmResponse = await ai.generate({
            prompt: `You are a music recommendation expert. Based on the user's favorite music style, "{{favoriteMusic}}", generate 3 diverse search queries to find songs they might like on Spotify. Use the provided tool to get the song recommendations.`,
            model: 'googleai/gemini-2.5-pro-preview',
            tools: [recommendationTool],
        });

        const toolResponse = llmResponse.toolRequest()?.output();
        
        if (!toolResponse) {
            // Handle case where the model doesn't use the tool
            // and just returns text. We can try searching with the text.
            const fallbackResults = await searchTracks(llmResponse.text(), 10);
            return { recommendations: fallbackResults };
        }

        // De-duplicate tracks based on ID
        const uniqueTracks = Array.from(new Map(toolResponse.map((track: any) => [track.id, track])).values());

        return { recommendations: uniqueTracks as any[] };
    }
);

/**
 * Gets personalized music recommendations.
 * @param {GetRecommendationsInput} input The user's music preferences.
 * @returns {Promise<GetRecommendationsOutput>} A promise that resolves to a list of recommended tracks.
 */
export async function getRecommendations(input: GetRecommendationsInput): Promise<GetRecommendationsOutput> {
    return getRecommendationsFlow(input);
}
