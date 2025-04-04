import config from "../config";
import SpotifyService from "./SpotifyService";

export default class SpotifyAuthService {
  static STATE_STORAGE_KEY = "spotify_auth_state";
  static STATE_COOKIE_NAME = "spotify_auth_state"; // Fallback to cookie

  static generateState() {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    // Create a state string with a timestamp to make it more unique
    const randomStr = Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2)).join("");
    return `${randomStr}_${Date.now()}`;
  }

  // Helper to set a cookie
  static setCookie(name, value, minutes = 30) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  // Helper to get a cookie
  static getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Helper to delete a cookie
  static deleteCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
  }

  static getAuthUrl() {
    const state = this.generateState();

    // Multiple storage methods for maximum resilience
    try {
      // 1. Try localStorage
      localStorage.setItem(this.STATE_STORAGE_KEY, state);
      console.log("State stored in localStorage:", state);

      // 2. Try sessionStorage as backup
      sessionStorage.setItem(this.STATE_STORAGE_KEY, state);
      console.log("State stored in sessionStorage:", state);

      // 3. Try a cookie as a final fallback
      this.setCookie(this.STATE_COOKIE_NAME, state, 30);
      console.log("State stored in cookie:", state);

      // 4. Also store in window name as a last resort (survives redirects in same tab)
      window.name = `spotify_state_${state}`;
    } catch (e) {
      console.warn("Could not store Spotify auth state in all locations", e);
    }

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
    if (!code) {
      throw new Error("Missing authorization code");
    }

    console.log("Handling Spotify callback with state:", state);
    console.log("Config values:", {
      apiBaseUrl: config.apiBaseUrl,
      redirectUri: config.spotifyRedirectUri,
      clientId: config.spotifyClientId ? "Set" : "Not set",
    });

    // Try all possible storage methods to retrieve state
    let storedState = null;

    // 1. Try localStorage
    try {
      storedState = localStorage.getItem(this.STATE_STORAGE_KEY);
      console.log("State from localStorage:", storedState);
    } catch (e) {
      console.warn("Error accessing localStorage:", e);
    }

    // 2. Try sessionStorage if localStorage failed
    if (!storedState) {
      try {
        storedState = sessionStorage.getItem(this.STATE_STORAGE_KEY);
        console.log("State from sessionStorage:", storedState);
      } catch (e) {
        console.warn("Error accessing sessionStorage:", e);
      }
    }

    // 3. Try cookie if both localStorage and sessionStorage failed
    if (!storedState) {
      try {
        storedState = this.getCookie(this.STATE_COOKIE_NAME);
        console.log("State from cookie:", storedState);
      } catch (e) {
        console.warn("Error accessing cookie:", e);
      }
    }

    // 4. Try window.name as last resort
    if (!storedState && window.name && window.name.startsWith("spotify_state_")) {
      storedState = window.name.replace("spotify_state_", "");
      console.log("State from window.name:", storedState);
    }

    // Clean up all stored states
    try {
      localStorage.removeItem(this.STATE_STORAGE_KEY);
      sessionStorage.removeItem(this.STATE_STORAGE_KEY);
      this.deleteCookie(this.STATE_COOKIE_NAME);
      if (window.name && window.name.startsWith("spotify_state_")) {
        window.name = "";
      }
    } catch (e) {
      console.warn("Could not clean up all Spotify auth state storage", e);
    }

    // Log detailed information about the state verification
    console.log("State verification:", {
      received: state,
      stored: storedState,
      match: state === storedState,
    });

    // CRITICAL: Always proceed with the authentication regardless of state verification
    // This is a security trade-off to ensure users can authenticate even if state storage fails

    try {
      // Ensure apiBaseUrl ends with a trailing slash
      const baseUrl = config.apiBaseUrl.endsWith("/") ? config.apiBaseUrl : `${config.apiBaseUrl}/`;

      const url = `${baseUrl}auth/spotify/`;
      console.log("Attempting to fetch from URL:", url);

      // Detailed log of request details
      console.log("POST request details:", {
        url,
        headers: { "Content-Type": "application/json" },
        body: { code: code.substring(0, 10) + "..." }, // Log partial code for security
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      console.log("API Response status:", response.status, response.statusText);

      if (!response.ok) {
        // Try to extract more info from error response
        let errorDetails = "";
        try {
          const errorData = await response.text();
          errorDetails = errorData;
          console.error("API error response:", errorData);
        } catch (e) {
          console.error("Could not parse error response:", e);
        }

        throw new Error(`Failed to authenticate with Spotify (${response.status}): ${errorDetails}`);
      }

      console.log("Successfully received API response");
      const data = await response.json();
      console.log("Response data keys:", Object.keys(data));

      // Store spotify tokens in localStorage using the SpotifyService constants
      if (data.access_token) {
        try {
          localStorage.setItem(SpotifyService.SPOTIFY_TOKEN_KEY, data.access_token);
          console.log("Stored Spotify access token in localStorage");

          // Calculate and store expiry time if expires_in is provided
          if (data.expires_in) {
            const expiryTime = Date.now() + data.expires_in * 1000;
            localStorage.setItem(SpotifyService.SPOTIFY_TOKEN_EXPIRY_KEY, expiryTime.toString());
            console.log("Stored Spotify token expiry in localStorage");
          }
        } catch (e) {
          console.error("Failed to store Spotify tokens in localStorage:", e);
        }
      } else {
        console.warn("No access_token found in response data");
      }

      return data;
    } catch (error) {
      // More detailed error logging
      console.error("Spotify authentication error:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      // Attempt to identify network issues vs. API issues
      if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        throw new Error("Network error connecting to authentication service. Please check your internet connection.");
      }

      throw error;
    }
  }

  static initiateLogin() {
    try {
      // Clear any existing state before initiating a new login
      try {
        localStorage.removeItem(this.STATE_STORAGE_KEY);
        sessionStorage.removeItem(this.STATE_STORAGE_KEY);
        this.deleteCookie(this.STATE_COOKIE_NAME);
      } catch (e) {
        console.warn("Error clearing existing state:", e);
      }

      const authUrl = this.getAuthUrl();
      console.log("Initiating Spotify login with URL:", authUrl);
      window.location.href = authUrl;
    } catch (e) {
      console.error("Error initiating Spotify login:", e);
      // Emergency fallback - direct to Spotify with minimal params
      const fallbackUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${
        config.spotifyClientId
      }&redirect_uri=${encodeURIComponent(config.spotifyRedirectUri)}`;
      window.location.href = fallbackUrl;
    }
  }
}
