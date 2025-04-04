import { useState, useEffect } from "react";
import { SpotifyService } from "../../../../utils/services";
import { FaSpotify } from "react-icons/fa";
import useSpotifyAuth from "../../../../hooks/useSpotifyAuth";

export default function SpotifyLibrary() {
  const [playlists, setPlaylists] = useState([]);
  const [savedTracks, setSavedTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { checkTokenAndShowPopupIfNeeded } = useSpotifyAuth();

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        // Check if we have a valid Spotify token, show popup if not
        if (!checkTokenAndShowPopupIfNeeded()) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const [playlistsData, savedTracksData, topArtistsData, topTracksData] = await Promise.all([
          SpotifyService.getUploadedTracks(),
        ]);

        setPlaylists(playlistsData.items);
        setSavedTracks(savedTracksData.items);
        setTopArtists(topArtistsData.items);
        setTopTracks(topTracksData.items);
      } catch (err) {
        setError("Failed to load Spotify data");
        console.error("Spotify data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
  }, []);

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

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-gray-800 p-4 rounded-lg">
              <img
                src={playlist.images[0]?.url}
                alt={playlist.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="text-lg font-semibold">{playlist.name}</h3>
              <p className="text-gray-400">{playlist.tracks.total} tracks</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topArtists.map((artist) => (
            <div key={artist.id} className="text-center">
              <img src={artist.images[0]?.url} alt={artist.name} className="w-32 h-32 rounded-full mx-auto mb-2" />
              <h3 className="font-medium">{artist.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
        <div className="space-y-2">
          {topTracks.map((track) => (
            <div key={track.id} className="flex items-center bg-gray-800 p-3 rounded-lg">
              <img src={track.album.images[2]?.url} alt={track.name} className="w-12 h-12 rounded mr-4" />
              <div>
                <h3 className="font-medium">{track.name}</h3>
                <p className="text-gray-400">{track.artists.map((a) => a.name).join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Saved Tracks</h2>
        <div className="space-y-2">
          {savedTracks.map((item) => (
            <div key={item.track.id} className="flex items-center bg-gray-800 p-3 rounded-lg">
              <img src={item.track.album.images[2]?.url} alt={item.track.name} className="w-12 h-12 rounded mr-4" />
              <div>
                <h3 className="font-medium">{item.track.name}</h3>
                <p className="text-gray-400">{item.track.artists.map((a) => a.name).join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
