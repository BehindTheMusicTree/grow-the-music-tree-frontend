import { useState, useEffect } from "react";
import { FaSpotify } from "react-icons/fa";
import { useSpotifyLibrary } from "../../../../contexts/spotify-library/useSpotifyLibrary";

export default function SpotifyLibrary() {
  const { spotifyTracks, error, isAuthenticated, fetchSpotifyTracks } = useSpotifyLibrary();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSpotifyTracks();
    }
    setLoading(false);
  }, [isAuthenticated, fetchSpotifyTracks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin text-green-500">
          <FaSpotify size={40} />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }

  // If no tracks and no error, it might be an authentication issue
  if (!spotifyTracks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <FaSpotify size={48} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Spotify tracks found</h2>
        <p className="text-gray-400 text-center mb-4">
          Your Spotify library appears to be empty, or there was an issue connecting to Spotify.
        </p>
        <button
          onClick={() => fetchSpotifyTracks()}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Reconnect with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Spotify Library</h2>
        <div className="space-y-2">
          {spotifyTracks.map((track, index) => (
            <div
              key={track.spotifyId || `track-${index}`}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{track.name}</h3>
                <p className="text-gray-600">{track.spotifyArtists?.map((artist) => artist.name).join(", ")}</p>
                <p className="text-sm text-gray-500">{track.album?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
