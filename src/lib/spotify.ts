
/**
 * @fileOverview A service for interacting with the Spotify Web API.
 */

// A simple in-memory cache for the Spotify access token
let accessToken: {
    value: string;
    expiresAt: number;
} | null = null;

let tokenPromise: Promise<string> | null = null;

/**
 * Gets a Spotify API access token using the Client Credentials Flow.
 * It caches the token in memory to avoid requesting a new one on every call.
 * @returns {Promise<string>} A promise that resolves to the access token.
 */
async function getAccessToken(): Promise<string> {
    if (accessToken && accessToken.expiresAt > Date.now()) {
        return accessToken.value;
    }
    
    // If a token request is already in flight, wait for it to complete
    if (tokenPromise) {
        return tokenPromise;
    }

    tokenPromise = (async () => {
        const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

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
            tokenPromise = null; // Clear the promise on failure
            throw new Error(`Failed to fetch Spotify access token: ${response.statusText}`);
        }

        const data = await response.json();
        const expiresIn = data.expires_in * 1000; // Convert to milliseconds

        accessToken = {
            value: data.access_token,
            expiresAt: Date.now() + expiresIn,
        };
        
        tokenPromise = null; // Clear the promise on success
        return accessToken.value;
    })();

    return tokenPromise;
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

/**
 * Searches for artists on Spotify.
 * @param {string} query The search query for the artist.
 * @param {number} [limit=1] The maximum number of results to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of artist items.
 */
export async function searchArtists(query: string, limit: number = 1): Promise<any[]> {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to search Spotify artists: ${response.statusText}`);
    }

    const data = await response.json();
    return data.artists.items;
}

/**
 * Gets details for a single artist from Spotify.
 * @param {string} artistId The Spotify ID of the artist.
 * @returns {Promise<any>} A promise that resolves to the artist object.
 */
export async function getArtist(artistId: string): Promise<any> {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch artist: ${response.statusText}`);
    return await response.json();
}

/**
 * Gets an artist's albums from Spotify.
 * @param {string} artistId The Spotify ID of the artist.
 * @param {number} [limit=20] The maximum number of albums to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of album items.
 */
export async function getArtistAlbums(artistId: string, limit: number = 20): Promise<any[]> {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=${limit}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch artist albums: ${response.statusText}`);
    const data = await response.json();
    return data.items;
}

/**
 * Gets tracks for a specific album from Spotify.
 * @param {string} albumId The Spotify ID of the album.
 * @param {number} [limit=50] The maximum number of tracks to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of track items.
 */
export async function getAlbumTracks(albumId: string, limit: number = 50): Promise<any[]> {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch album tracks: ${response.statusText}`);
    const data = await response.json();
    return data.items;
}
