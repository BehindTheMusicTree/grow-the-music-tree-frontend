"use client";

import { useQuery } from "@tanstack/react-query";

const fetchTracks = async (page = 1, pageSize = 50) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

const fetchTrack = async (uploadedTrackUuid) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/${uploadedTrackUuid}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export function useTracks(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ["tracks", page, pageSize],
    queryFn: () => fetchTracks(page, pageSize),
  });
}

export function useTrack(uploadedTrackUuid) {
  return useQuery({
    queryKey: ["track", uploadedTrackUuid],
    queryFn: () => fetchTrack(uploadedTrackUuid),
    enabled: !!uploadedTrackUuid,
  });
}
