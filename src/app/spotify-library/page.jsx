"use client";

import { FaSpinner } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useSpotifyLibrary } from "@contexts/SpotifyLibraryContext";

export default function SpotifyLibrary() {
  const { spotifyLibTracks, error, loading } = useSpotifyLibrary();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FaSpinner className="text-[#1DB954] text-4xl animate-spin" />
        <p className="text-[#1DB954] mt-4">Loading Spotify library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MdError className="text-red-500 text-4xl" />
        <p className="text-red-500 mt-4">{error.message || "An error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Spotify Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spotifyLibTracks &&
          spotifyLibTracks.map((track) => (
            <div key={track.id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold">{track.name}</h2>
              <p className="text-gray-600">{track.artists.map((artist) => artist.name).join(", ")}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
