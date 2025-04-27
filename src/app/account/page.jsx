"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "@contexts/SessionContext";

export default function AccountPage() {
  const { setSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    fetchProfile();
  }, []); // Add empty dependency array to run only once on mount

  if (loading) {
    return (
      <div className="account-page p-8">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading profile...</p>
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
                <Image
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
                  router.push("/");
                  setSession(null);
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
