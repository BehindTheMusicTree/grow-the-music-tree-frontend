import { useState, useEffect } from "react";

/**
 * Utility to check if code is running in a browser environment
 * Use this before accessing browser-specific APIs like document or window
 * @returns {boolean} True if running in a browser environment, false otherwise
 */
export const isBrowser = () => typeof window !== "undefined";

/**
 * Safe version of document for use in Next.js components
 * Returns null during server-side rendering
 * @returns {Document|null} The document object or null if not in browser
 */
export const safeDocument = isBrowser() ? document : null;

/**
 * Safe version of window for use in Next.js components
 * Returns null during server-side rendering
 * @returns {Window|null} The window object or null if not in browser
 */
export const safeWindow = isBrowser() ? window : null;

/**
 * Hook to track component mounting state
 * Use this for components that need to access browser APIs only after client-side hydration
 *
 * Example usage:
 * ```
 * import { useIsMounted } from '@utils/browser';
 *
 * function MyComponent() {
 *   const isMounted = useIsMounted();
 *
 *   if (!isMounted) {
 *     return null; // Return null during SSR
 *   }
 *
 *   // Safe to use document/window here
 *   return <div>{document.title}</div>;
 * }
 * ```
 *
 * @returns {boolean} True if component is mounted in browser
 */
export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted;
};
