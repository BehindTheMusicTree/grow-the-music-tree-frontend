"use client";

import { AuthFetch } from "@hooks/useAuthenticatedApi";

export interface TrackData {
  title: string;
  artistName?: string;
  genreName?: string;
  albumName?: string;
  rating?: number | null;
}

export interface UploadedTrack {
  uuid: string;
  title: string;
  artist?: {
    name: string;
  };
  genre?: {
    name: string;
  };
  album?: {
    name: string;
  };
  rating: number | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function listUploadedTracks(
  authFetch: AuthFetch,
  page = 1,
  pageSize = 50
): Promise<PaginatedResponse<UploadedTrack>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`library/uploaded?${params.toString()}`);
  return response.json();
}

export async function uploadTrack(authFetch: AuthFetch, trackData: TrackData): Promise<UploadedTrack> {
  const response = await authFetch("library/uploaded/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}

export async function updateUploadedTrack(
  authFetch: AuthFetch,
  trackId: string,
  trackData: TrackData
): Promise<UploadedTrack> {
  const response = await authFetch(`library/uploaded/${trackId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}

export async function downloadTrack(authFetch: AuthFetch, trackId: string): Promise<Response> {
  return authFetch(`library/uploaded/${trackId}/download/`, { resolveOnError: true });
}
