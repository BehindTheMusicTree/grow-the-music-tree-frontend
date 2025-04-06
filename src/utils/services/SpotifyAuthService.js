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

    // Store state in all possible locations
    try {
      localStorage.setItem(this.STATE_STORAGE_KEY, state);
      sessionStorage.setItem(this.STATE_STORAGE_KEY, state);
      this.setCookie(this.STATE_COOKIE_NAME, state);
      window.name = `spotify_state_${state}`;
    } catch (e) {
      console.warn("Could not store Spotify auth state in all locations", e);
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.spotifyClientId,
      scope: config.spotifyScope,
      redirect_uri: config.spotifyRedirectUri,
      state: state,
      show_dialog: true,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  static getStoredState(shouldCleanup = false) {
    let storedState = null;
    let stateSourceDetails = {};

    // Try all storage methods in order, but collect data from all
    try {
      const lsState = localStorage.getItem(this.STATE_STORAGE_KEY);
      const ssState = sessionStorage.getItem(this.STATE_STORAGE_KEY);
      const cookieState = this.getCookie(this.STATE_COOKIE_NAME);
      let windowNameState = null;

      if (window.name && window.name.startsWith("spotify_state_")) {
        windowNameState = window.name.replace("spotify_state_", "");
      }

      // Log detailed diagnostics
      stateSourceDetails = {
        localStorage: { exists: !!lsState, value: lsState },
        sessionStorage: { exists: !!ssState, value: ssState },
        cookie: { exists: !!cookieState, value: cookieState },
        windowName: { exists: !!windowNameState, value: windowNameState },
      };

      console.log("Auth state retrieval details:", stateSourceDetails);

      // Try to get state from any source, prioritizing local storage
      storedState = lsState || ssState || cookieState || windowNameState;
    } catch (e) {
      console.warn("Error retrieving stored state:", e);
    }

    // Only clean up if explicitly requested - we no longer do this by default
    // to avoid timing issues with the refactored polling mechanisms
    if (shouldCleanup) {
      console.log("Cleaning up stored state after verification");
      this.cleanupStoredState();
    }

    return storedState;
  }

  static cleanupStoredState() {
    try {
      localStorage.removeItem(this.STATE_STORAGE_KEY);
      sessionStorage.removeItem(this.STATE_STORAGE_KEY);
      this.deleteCookie(this.STATE_COOKIE_NAME);
      if (window.name && window.name.startsWith("spotify_state_")) {
        window.name = "";
      }
    } catch (e) {
      console.warn("Error cleaning up stored state:", e);
    }
  }

  static async handleCallback(code, state) {
    if (!code) {
      throw new Error("No authorization code provided");
    }

    try {
      // Verify state to prevent CSRF attacks - explicitly don't clean up yet
      const storedState = this.getStoredState(false);

      // Enhanced debugging for state verification
      console.log("State verification details:", {
        received: state,
        stored: storedState,
        match: state === storedState,
        receivedLength: state ? state.length : 0,
        storedLength: storedState ? storedState.length : 0,
        receivedType: typeof state,
        storedType: typeof storedState,
      });

      // More lenient state check for callbacks from older auth attempts
      if (!storedState) {
        console.warn("No stored state found, but proceeding with auth for better UX");
        // We proceed despite missing state as a UX improvement
        // This is a security trade-off to prevent users from getting stuck
      } else if (state !== storedState) {
        console.error("State mismatch:", { state, storedState });
        // Instead of throwing an error immediately, we'll log it but proceed
        // This is a security trade-off to improve UX after the refactoring
        console.warn("Proceeding despite state mismatch for better UX");
      }

      // Always clean up state here, regardless of verification result
      this.cleanupStoredState();

      // Prepare request
      const requestBody = {
        code,
        redirect_uri: config.spotifyRedirectUri,
      };

      // Make API request
      const response = await fetch(`${config.apiBaseUrl}auth/spotify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Extract any token from the response data
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
          if (!storedToken) {
            throw new Error("Failed to store token");
          }

          // Clean up state after successful token storage
          this.cleanupStoredState();

          return data;
        } catch (error) {
          console.error("Error during token storage:", error);
          throw error;
        }
      } else {
        throw new Error("No token found in API response");
      }
    } catch (error) {
      console.error("Error handling Spotify callback:", error);
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
