"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const fetchTracks = async (page = 1, pageSize = 50) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("Not authenticated");
  }

  return response.json();
};

export default function TracksList({ initialData }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tracks", 1, 50],
    queryFn: () => fetchTracks(1, 50),
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

  if (isLoading && !data) return <div>Loading...</div>;

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
