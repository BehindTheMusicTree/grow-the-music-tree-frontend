"use client";

import { FaSpinner, FaSync } from "react-icons/fa";
import { MdError, MdSyncProblem } from "react-icons/md";
import Pagination from "@components/ui/Pagination";
import { useSpotifyLibTracks } from "@contexts/SpotifyLibTracksContext";

export default function SpotifyLibrary() {
  const {
    spotifyLibTracks,
    error,
    loading,
    quickSyncSpotifyLibTracks,
    isQuickSyncPending,
    fullSyncSpotifyLibTracks,
    isFullSyncPending,
    currentPage,
    pageSize,
    totalTracks,
    totalPages,
    onPageChange,
    refreshTracks,
  } = useSpotifyLibTracks();

  const handleQuickSync = async () => {
    await quickSyncSpotifyLibTracks();
    refreshTracks();
  };

  const handleFullSync = async () => {
    await fullSyncSpotifyLibTracks();
    refreshTracks();
  };

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Spotify Library</h1>
        <div className="text-sm text-gray-500">
          Showing {spotifyLibTracks?.length || 0} of {totalTracks} tracks
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
          spotifyLibTracks.map((track) => (
            <div key={track.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              {track.album?.images?.[0]?.url && (
                <img
                  src={track.album.images[0].url}
                  alt={`${track.name} album cover`}
                  className="w-full h-32 object-cover mb-2 rounded"
                />
              )}
              <h2 className="font-semibold">{track.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
              {track.album && <p className="text-gray-500 text-sm">{track.album.name}</p>}
            </div>
          ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} className="mt-6" />

      <div className="mt-2 text-center text-sm text-gray-500">
        Page {currentPage} of {totalPages} • {totalTracks} total tracks
      </div>
    </div>
  );
}
