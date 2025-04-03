import config from "../config";

export default class SpotifyAuthService {
  static generateState() {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2)).join("");
  }

  static getAuthUrl() {
    const state = this.generateState();
    // Store state in sessionStorage for verification when the user returns
    sessionStorage.setItem("spotify_auth_state", state);

    // Use the redirect URI directly from environment variables
    // This should exactly match what's registered in Spotify Developer Dashboard
    const redirectUri = config.spotifyRedirectUri;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.spotifyClientId,
      scope: config.spotifyScope,
      redirect_uri: redirectUri,
      state: state,
      show_dialog: true,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  static async handleCallback(code, state) {
    // Verify the state parameter
    const storedState = sessionStorage.getItem("spotify_auth_state");
    sessionStorage.removeItem("spotify_auth_state"); // Clean up

    if (state === null || state !== storedState) {
      throw new Error("State verification failed");
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}auth/spotify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with Spotify");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Spotify authentication error:", error);
      throw error;
    }
  }

  static initiateLogin() {
    window.location.href = this.getAuthUrl();
  }
}
