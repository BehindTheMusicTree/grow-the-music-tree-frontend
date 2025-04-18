"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { listUploadedTracks } from "@lib/api-service-service/uploaded-track";

export default function TracksList({ initialData }) {
  const router = useRouter();
  const { data, loading, isError, error } = useQuery({
    queryKey: ["tracks", 1, 50],
    queryFn: () => listUploadedTracks(1, 50),
    initialData,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    retry: false,
  });

  if (isError) {
    if (error.message === "Not authenticated") {
      router.push("/login");
      return null;
    }
    return <div>Error loading tracks</div>;
  }

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
