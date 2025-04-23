"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";

import { useSession } from "@/contexts/SessionContext";
import {
  listUploadedTracks as listUploadedTracksApi,
  updateUploadedTrack as updateUploadedTrackApi,
  downloadTrack as downloadTrackApi,
  TrackData,
  UploadedTrack,
  PaginatedResponse,
} from "@/lib/music-tree-api-service/uploaded-track";
import { useAuthenticatedApi, type AuthFetch } from "@/hooks/useAuthenticatedApi";

interface UpdateTrackData extends Partial<TrackData> {}

interface UploadedTrackContextType {
  uploadedTracks: UploadedTrack[];
  updateUploadedTrack: UseMutationResult<UploadedTrack, Error, { trackId: string; data: UpdateTrackData }>;
  downloadTrack: (trackId: string) => Promise<Response>;
  error: Error | null;
  isLoading: boolean;
  refreshTracks: () => void;
}

const UploadedTrackContext = createContext<UploadedTrackContextType | null>(null);

export const UploadedTrackProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const authFetch = useAuthenticatedApi<PaginatedResponse<UploadedTrack>>(listUploadedTracksApi);

  const {
    data: uploadedTracksResponse,
    error,
    isLoading,
    refetch: refreshTracks,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: () => authFetch(),
    enabled: !!session,
  });

  const updateUploadedTrack = useMutation({
    mutationFn: ({ trackId, data }: { trackId: string; data: UpdateTrackData }) =>
      updateUploadedTrackApi(authFetch as AuthFetch, trackId, data as TrackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const downloadTrack = async (trackId: string): Promise<Response> => {
    return downloadTrackApi(authFetch as AuthFetch, trackId);
  };

  const value = {
    uploadedTracks: uploadedTracksResponse?.results || [],
    updateUploadedTrack,
    downloadTrack,
    error: error as Error | null,
    isLoading,
    refreshTracks,
  };

  return <UploadedTrackContext.Provider value={value}>{children}</UploadedTrackContext.Provider>;
};

export const useUploadedTrack = () => {
  const context = useContext(UploadedTrackContext);
  if (!context) {
    throw new Error("useUploadedTrack must be used within an UploadedTrackProvider");
  }
  return context;
};
\