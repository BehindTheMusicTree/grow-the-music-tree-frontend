import { useAuth } from "@contexts/AuthContext";

/**
 * Custom hook that safely retrieves authentication state
 * Follows React best practices by keeping hook calls unconditional
 * and still handling the case when AuthContext is not available
 *
 * @returns {boolean} Current authentication state
 */
export function useAuthState() {
  // Always call useAuth unconditionally at the top level
  const authContext = useAuth();

  // Check if valid context was returned
  if (!authContext) {
    return false;
  }

  return authContext.isAuthenticated || false;
}

export default useAuthState;
