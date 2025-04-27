"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

import { FaSpinner, FaSync } from "react-icons/fa";
import { MdSyncProblem } from "react-icons/md";
import {
  useListSpotifyLibTracks,
  useQuickSyncSpotifyLibTracks,
  useFullSyncSpotifyLibTracks,
} from "@hooks/useSpotifyLibTracks";
import type { SpotifyLibTrackSimple } from "@schemas/domain/spotify/spotify-lib-track";

export default function SpotifyLibrary() {
  const {
    data: spotifyLibTracksResponse,
    isPending: isListingPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListSpotifyLibTracks();
  const { mutate: quickSyncSpotifyLibTracks, isPending: isQuickSyncPending } = useQuickSyncSpotifyLibTracks();
  const { mutate: fullSyncSpotifyLibTracks, isPending: isFullSyncPending } = useFullSyncSpotifyLibTracks();

  const spotifyLibTracks = useMemo(
    () => spotifyLibTracksResponse?.pages?.flatMap((page) => page.results) || [],
    [spotifyLibTracksResponse?.pages]
  );

  console.log("Infinite query data:", spotifyLibTracksResponse);
  console.log("Pages:", spotifyLibTracksResponse?.pages);
  console.log("First page results:", spotifyLibTracksResponse?.pages?.[0]?.results);

  const currentPage = spotifyLibTracksResponse?.pages?.[spotifyLibTracksResponse.pages.length - 1]?.page || 1;
  const totalPages = spotifyLibTracksResponse?.pages?.[0]?.totalPages || 1;
  const total = spotifyLibTracksResponse?.pages?.[0]?.overallTotal || 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isListingPending) {
      console.log("SpotifyLibrary data", spotifyLibTracksResponse);
    }
  }, [spotifyLibTracksResponse, isListingPending]);

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
    <div className="flex flex-col h-screen">
      <div className="flex-none p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Your Spotify Library</h1>
          <div className="text-sm text-gray-500">
            Showing {spotifyLibTracks.length} of {total} tracks
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spotifyLibTracks.map((spotifyLibTrack) => (
            <div key={spotifyLibTrack.spotifyId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="font-semibold">{spotifyLibTrack.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {spotifyLibTrack.spotifyArtists.map((artist) => artist.name).join(", ")}
              </p>
              <p className="text-gray-500 text-sm">{spotifyLibTrack.album}</p>
              <p className="text-gray-500 text-sm">{spotifyLibTrack.durationStrInHourMinSec}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 text-center text-sm text-gray-500">
          Page {currentPage} of {totalPages} • {total} total tracks
        </div>
        {isFetchingNextPage && (
          <div className="flex justify-center mt-4">
            <FaSpinner className="text-[#1DB954] text-2xl animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
