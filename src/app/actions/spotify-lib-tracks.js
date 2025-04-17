"use client";

// Client-side implementation for frontend-only Next.js
// Replaces server action with direct API call

/**
 * Fetch Spotify library tracks directly from client-side
 * @param {number} page - Page number for pagination
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} - Response with data property containing tracks
 */
export async function listSpotifyLibTracks(page = 1, pageSize = 50) {
  console.log("listSpotifyLibTracks (client-side)");
  
  try {
    // Get the base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("API base URL is not configured");
    }
    
    // Get auth token - assuming stored in localStorage or similar
    // This would need to be adapted to how your frontend manages tokens
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      return {
        success: false,
        error: {
          type: "auth",
          code: "unauthorized",
          message: "Authentication required",
        },
      };
    }
    
    // Make authenticated request to the API
    const response = await fetch(`${baseUrl}/library/uploaded/?page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: {
            type: "auth",
            code: "unauthorized",
            message: "Authentication required",
          },
        };
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Match the format that withAuthProtection would have returned
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error fetching Spotify tracks:", error);
    throw error;
  }
}