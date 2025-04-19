"use client";

import { useQuery } from "@tanstack/react-query";
import { listUploadedTracks } from "@lib/api-service/uploaded-track";

export default function TracksList({ initialData }) {
  const { data, loading } = useQuery({
    queryKey: ["tracks", 1, 50],
    queryFn: () => listUploadedTracks(1, 50),
    initialData,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    retry: false,
  });

  if (loading && !data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Tracks</h1>
      {data.results.length === 0 ? (
        <div>No tracks found. Please log in to see your tracks.</div>
      ) : (
        <ul>
          {data.results.map((track) => (
            <li key={track.uuid}>
              {track.title} - {track.artistName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
