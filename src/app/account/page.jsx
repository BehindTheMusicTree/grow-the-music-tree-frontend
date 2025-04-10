"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "@/contexts/AuthContext";
import SpotifyOAuthService from "@utils/services/SpotifyOAuthService";

export default function AccountPage() {
  const isAuthenticated = useAuthState();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          // This is a placeholder - implement actual profile fetching using SpotifyOAuthService
          // const profileData = await SpotifyOAuthService.getProfile();
          // For now, simulating profile data
          const profileData = {
            display_name: "Spotify User",
            email: "user@example.com",
            images: [{ url: "" }],
            country: "US",
            product: "premium",
            followers: { total: 0 },
            external_urls: { spotify: "https://open.spotify.com/user/example" },
          };
          setProfile(profileData);
        } catch (err) {
          setError(err.message || "Failed to fetch profile");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="account-page p-8">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">You need to connect your Spotify account to view your profile.</p>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            onClick={() => SpotifyOAuthService.login()}
          >
            Connect Spotify
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="account-page p-8">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-page p-8">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="bg-red-100 p-6 rounded-lg shadow-md text-red-700">
          <p>Error loading profile: {error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page p-8">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      {profile && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 p-6 text-white">
            <div className="flex items-center">
              {profile.images?.[0]?.url ? (
                <img
                  src={profile.images[0].url}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full border-2 border-white mr-4"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="text-2xl text-gray-500">{profile.display_name?.charAt(0) || "U"}</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{profile.display_name}</h2>
                <p className="text-green-100">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Profile Details</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span>{profile.country || "Not specified"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Subscription:</span>
                    <span className="capitalize">{profile.product || "Free"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Followers:</span>
                    <span>{profile.followers?.total || 0}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href={profile.external_urls?.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      Open in Spotify
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={() => {
                  // Implement logout functionality
                  // SpotifyOAuthService.logout();
                  window.location.reload();
                }}
              >
                Disconnect Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
