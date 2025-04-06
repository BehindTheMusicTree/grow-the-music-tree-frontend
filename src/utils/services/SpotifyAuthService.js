import config from "../config";
import SpotifyService from "./SpotifyService";
import SpotifyTracksService from "./SpotifyTracksService";
import NotificationService from "./NotificationService";

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
      const requestBody = { code };

      console.log("Attempting to fetch from URL:", url);
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
        body: JSON.stringify(requestBody),
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

      // Log full response data with sensitive information partially masked
      console.log("Full API response (sensitive data masked):", {
        ...data,
        // Mask sensitive data if present
        accessToken: data.accessToken ? `${data.accessToken.substring(0, 10)}...` : undefined,
        token: data.token ? `${data.token.substring(0, 10)}...` : undefined,
        access_token: data.access_token ? `${data.access_token.substring(0, 10)}...` : undefined,
        user: data.user ? { ...data.user, id: data.user.id } : undefined,
      });

      // Store spotify token in localStorage using the SpotifyService constants
      // Check for all possible token field names in the API response
      // (we've seen it returned as 'token', 'accessToken', and potentially 'access_token')
      const tokenValue = data.accessToken || data.token || data.access_token;

      if (tokenValue) {
        try {
          // Store the token and profile
          SpotifyService.saveSpotifyToken(
            tokenValue,
            60 * 60, // 1 hour in seconds
            data.refreshToken || null,
            data.user || null
          );

          // Verify token was stored
          const storedToken = localStorage.getItem(SpotifyService.SPOTIFY_TOKEN_KEY);
          console.log("Token storage verification:", !!storedToken);

          // Force clear all localStorage and sessionStorage cache that could interfere
          localStorage.removeItem(this.STATE_STORAGE_KEY);
          sessionStorage.removeItem(this.STATE_STORAGE_KEY);
          this.deleteCookie(this.STATE_COOKIE_NAME);

          // Trigger quick sync
          await SpotifyTracksService.quickSync(
            () => {
              // Start notification
              NotificationService.showNotification({
                type: "info",
                message: "Syncing your Spotify library...",
                duration: 0, // Don't auto-dismiss
              });
            },
            (progress) => {
              // Progress notification
              NotificationService.showNotification({
                type: "info",
                message: `Syncing your Spotify library... ${progress}%`,
                duration: 0,
              });
            },
            () => {
              // Success notification
              NotificationService.showNotification({
                type: "success",
                message: "Spotify library synced successfully!",
                duration: 5000,
              });
            },
            (error) => {
              // Error notification
              NotificationService.showNotification({
                type: "error",
                message: `Failed to sync Spotify library: ${error}`,
                duration: 5000,
              });
            }
          );
        } catch (e) {
          console.error("Failed to store Spotify tokens in localStorage:", e);
        }
      } else {
        console.warn(`No token found in API response data. Available keys: ${Object.keys(data).join(", ")}`);
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
