"use client";

import Image from "next/image";
import { useState } from "react";

import { FaSpinner, FaSync } from "react-icons/fa";
import { MdSyncProblem } from "react-icons/md";
import Pagination from "@components/ui/Pagination";
import {
  useListSpotifyLibTracks,
  useQuickSyncSpotifyLibTracks,
  useFullSyncSpotifyLibTracks,
} from "@hooks/useSpotifyLibTracks";
export default function SpotifyLibrary() {
  const [page, setPage] = useState(1);
  const { data: spotifyLibTracks, isPending: isListingPending } = useListSpotifyLibTracks(page);
  const { mutate: quickSyncSpotifyLibTracks, isPending: isQuickSyncPending } = useQuickSyncSpotifyLibTracks();
  const { mutate: fullSyncSpotifyLibTracks, isPending: isFullSyncPending } = useFullSyncSpotifyLibTracks();

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleQuickSync = async () => {
    await quickSyncSpotifyLibTracks();
  };

  const handleFullSync = async () => {
    await fullSyncSpotifyLibTracks();
  };

  if (isListingPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FaSpinner className="text-[#1DB954] text-4xl animate-spin" />
        <p className="text-[#1DB954] mt-4">Loading Spotify library...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Spotify Library</h1>
        <div className="text-sm text-gray-500">
          Showing {spotifyLibTracks?.length || 0} of {spotifyLibTracks?.total || 0} tracks
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className="flex items-center px-4 py-2 bg-[#1DB954] text-white rounded hover:bg-[#1AA84A] disabled:opacity-50"
          onClick={handleQuickSync}
          disabled={isQuickSyncPending || isFullSyncPending}
        >
          <FaSync className={isQuickSyncPending ? "animate-spin mr-2" : "mr-2"} />
          Quick Sync
        </button>
        <button
          className="flex items-center px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50"
          onClick={handleFullSync}
          disabled={isQuickSyncPending || isFullSyncPending}
        >
          <MdSyncProblem className={isFullSyncPending ? "animate-spin mr-2" : "mr-2"} />
          Full Sync
          <span className="ml-1 text-xs">(may take longer)</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {spotifyLibTracks &&
          spotifyLibTracks.map((spotifyLibTrack) => (
            <div key={spotifyLibTrack.uuid} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              {spotifyLibTrack.album?.images?.[0]?.url && (
                <Image
                  src={spotifyLibTrack.album.images[0].url}
                  alt={`${spotifyLibTrack.name} album cover`}
                  className="w-full h-32 object-cover mb-2 rounded"
                  width={100}
                  height={100}
                />
              )}
              <h2 className="font-semibold">{spotifyLibTrack.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {spotifyLibTrack.artists.map((artist) => artist.name).join(", ")}
              </p>
              {spotifyLibTrack.album && <p className="text-gray-500 text-sm">{spotifyLibTrack.album.name}</p>}
            </div>
          ))}
      </div>

      {spotifyLibTracks && (
        <>
          <Pagination
            currentPage={spotifyLibTracks.page}
            totalPages={spotifyLibTracks.totalPages}
            onPageChange={handlePageChange}
            className="mt-6"
          />

          <div className="mt-2 text-center text-sm text-gray-500">
            Page {spotifyLibTracks.page} of {spotifyLibTracks.totalPages} • {spotifyLibTracks.total} total tracks
          </div>
        </>
      )}
    </div>
  );
}
