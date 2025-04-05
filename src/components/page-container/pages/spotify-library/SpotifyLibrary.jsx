import { useState, useEffect } from "react";
import { SpotifyTracksService } from "../../../../utils/services";
import { FaSpotify } from "react-icons/fa";
import useSpotifyAuth from "../../../../hooks/useSpotifyAuth";

export default function SpotifyLibrary() {
  const [spotifyTracks, setSpotifyTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        // Check if we have a valid Spotify token, show popup if not
        if (!checkTokenAndShowAuthIfNeeded()) {
          setLoading(false);
          return;
        }

        setLoading(true);

        // Use the new SpotifyTracksService
        const tracksData = await SpotifyTracksService.getLibTracks();
        console.log("spotifyTracksData", tracksData);

        // Extract tracks from the response
        setSpotifyTracks(tracksData.results || []);
      } catch (err) {
        setError("Failed to load Spotify data");
        console.error("Spotify data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
  }, [checkTokenAndShowAuthIfNeeded]);

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
          onClick={() => checkTokenAndShowAuthIfNeeded(true)}
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
        <h2 className="text-2xl font-bold mb-4">Your Spotify Library</h2>
        <div className="space-y-2">
          {spotifyTracks.map((track) => (
            <div key={track.id} className="flex items-center bg-gray-800 p-3 rounded-lg">
              <img
                src={track.album?.images[0]?.url || "/assets/images/album-cover-default.png"}
                alt={track.name}
                className="w-12 h-12 rounded mr-4"
              />
              <div>
                <h3 className="font-medium">{track.name}</h3>
                <p className="text-gray-400">{track.artists?.map((a) => a.name).join(", ") || "Unknown Artist"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
