import useSpotifyAuth from "./useSpotifyAuth";

/**
 * Custom hook that extracts just the authentication actions needed
 * Follows best practices by focusing on specific functionality
 * and handling edge cases gracefully
 *
 * @returns {Function} Function to check token and show auth if needed
 */
export function useSpotifyAuthActions() {
  // Always call hook unconditionally at the top level
  const spotifyAuth = useSpotifyAuth();

  // Handle case where context might not be available
  if (!spotifyAuth || typeof spotifyAuth.checkTokenAndShowAuthIfNeeded !== "function") {
    // Return a no-op function that returns false (auth failed)
    return () => false;
  }

  return spotifyAuth.checkTokenAndShowAuthIfNeeded;
}

export default useSpotifyAuthActions;
