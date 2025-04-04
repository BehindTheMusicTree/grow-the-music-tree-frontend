import { useState, useEffect } from "react";
import SpotifyService from "../utils/services/SpotifyService";
import useSpotifyAuth from "../hooks/useSpotifyAuth";

const SpotifyTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;
  const { checkTokenAndShowPopupIfNeeded } = useSpotifyAuth();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        // Check if we have a valid Spotify token, show popup if not
        if (!checkTokenAndShowPopupIfNeeded()) {
          setLoading(false);
          return;
        }

        const response = await SpotifyService.getUploadedTracks(currentPage, pageSize);
        setTracks(response.results || []);
        setTotalPages(response.total_pages || 1);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTracks();
  }, [currentPage, checkTokenAndShowPopupIfNeeded]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Spotify Tracks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white rounded-lg shadow-md p-4">
            {track.album_image && (
              <img src={track.album_image} alt={track.name} className="w-full h-48 object-cover rounded-md mb-4" />
            )}
            <h2 className="text-xl font-semibold mb-2">{track.name}</h2>
            <p className="text-gray-600 mb-2">{track.artist}</p>
            <p className="text-sm text-gray-500">{track.album}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SpotifyTracks;
