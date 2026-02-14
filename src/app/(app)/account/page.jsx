"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useFetchSpotifyUser } from "@hooks/useSpotifyUser";

export default function AccountPage() {
  const { handleSpotifyOAuth, logout } = useSpotifyAuth();
  const { data: profile, isLoading, isError, error } = useFetchSpotifyUser();
  const spotifyProfileUrl = profile?.id ? spotifyUserProfileUrl(profile.id) : null;
  const spotifyRequired = isError && error?.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED;

  useEffect(() => {
    console.error(`Error loading account: ${error}`);
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Account</h1>
        <div className="flex h-64 items-center justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (spotifyRequired) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Account</h1>
        <div className="flex flex-col h-64 items-center justify-center gap-4">
          <p className="text-gray-700">{error?.message ?? "Connect Spotify to continue."}</p>
          <button
            type="button"
            className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            onClick={handleSpotifyOAuth}
          >
            Connect Spotify
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    const message = error?.code != null ? error?.message : "Failed to load profile.";
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Account</h1>
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-600">{message}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Account</h1>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="bg-green-600 p-6 text-white">
          <div className="flex items-center">
            {profile.images?.[0]?.url ? (
              <Image
                src={profile.images[0].url}
                alt={profile.display_name}
                width={80}
                height={80}
                className="mr-4 h-20 w-20 rounded-full border-2 border-white"
              />
            ) : (
              <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                <span className="text-2xl text-gray-500">{profile.display_name?.charAt(0) ?? "U"}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{profile.display_name}</h2>
              <p className="text-green-100">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-medium">Profile Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span>{profile.country ?? "Not specified"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Subscription:</span>
                  <span className="capitalize">{profile.product ?? "Free"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Followers:</span>
                  <span>{profile.followers?.total ?? 0}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Links</h3>
              <ul className="space-y-2">
                {spotifyProfileUrl && (
                  <li>
                    <a
                      href={spotifyProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 transition-colors hover:text-green-800"
                    >
                      Open in Spotify
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-4">
            <button
              type="button"
              className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              onClick={logout}
            >
              Disconnect Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
