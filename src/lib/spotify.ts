/**
 * @fileOverview A service for interacting with the Spotify Web API.
 */

// A simple in-memory cache for the Spotify access token
let accessToken: {
    value: string;
    expiresAt: number;
} | null = null;

/**
 * Gets a Spotify API access token using the Client Credentials Flow.
 * It caches the token in memory to avoid requesting a new one on every call.
 * @returns {Promise<string>} A promise that resolves to the access token.
 */
async function getAccessToken(): Promise<string> {
    if (accessToken && accessToken.expiresAt > Date.now()) {
        return accessToken.value;
    }

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        throw new Error("Spotify client ID or secret not configured in .env file");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch Spotify access token: ${response.statusText}`);
    }

    const data = await response.json();
    const expiresIn = data.expires_in * 1000; // Convert to milliseconds

    accessToken = {
        value: data.access_token,
        expiresAt: Date.now() + expiresIn,
    };

    return accessToken.value;
}

/**
 * Searches for tracks on Spotify.
 * @param {string} query The search query.
 * @param {number} [limit=10] The maximum number of results to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of track items.
 */
export async function searchTracks(query: string, limit: number = 10): Promise<any[]> {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to search Spotify tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.items;
}
