"use client";

import Image from "next/image";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import { useLogout } from "@hooks/useLogout";
import { useSession } from "@contexts/SessionContext";
import { useFetchSpotifyUser } from "@hooks/useSpotifyUser";
import { spotifyUserProfileUrl } from "@lib/constants/routes";

export default function AccountPage() {
  const { session } = useSession();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const { handleGoogleOAuth } = useGoogleAuth();
  const { logout } = useLogout();
  const { data: profile, isLoading } = useFetchSpotifyUser({ skipGlobalError: true });
  const spotifyProfileUrl = profile?.id ? spotifyUserProfileUrl(profile.id) : undefined;
  const hasSession = Boolean(session?.accessToken);
  const hasSpotifyProfile = Boolean(profile?.id);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Account</h1>
        <div className="flex h-64 items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Account</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="border-b border-gray-200 bg-green-600 p-4">
            <h2 className="text-lg font-semibold text-white">Spotify</h2>
          </div>
          <div className="p-6">
            {hasSpotifyProfile ? (
              <>
                <div className="flex items-center">
                  {profile.images?.[0]?.url ? (
                    <Image
                      src={profile.images[0].url}
                      alt={profile.display_name}
                      width={56}
                      height={56}
                      className="mr-4 h-14 w-14 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-xl text-gray-500">
                        {profile.display_name?.charAt(0) ?? "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{profile.display_name}</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Followers</span>
                    <span>{profile.followers?.total ?? 0}</span>
                  </li>
                </ul>
                {spotifyProfileUrl && (
                  <a
                    href={spotifyProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm text-green-600 hover:text-green-800"
                  >
                    Open in Spotify
                  </a>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600">
                  Connect your Spotify account to use My Spotify Library and related features.
                </p>
                <button
                  type="button"
                  className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  onClick={handleSpotifyOAuth}
                >
                  Connect Spotify
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="border-b border-gray-200 bg-gray-700 p-4">
            <h2 className="text-lg font-semibold text-white">Google</h2>
          </div>
          <div className="p-6">
            {hasSession && !hasSpotifyProfile ? (
              <p className="text-gray-700">You are signed in with Google.</p>
            ) : (
              <button
                type="button"
                className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-800 transition-colors hover:bg-gray-50"
                onClick={handleGoogleOAuth}
              >
                Sign in with Google
              </button>
            )}
          </div>
        </section>
      </div>

      {hasSession && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <button
            type="button"
            className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            onClick={logout}
          >
            Disconnect account
          </button>
        </div>
      )}
    </div>
  );
}
