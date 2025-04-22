"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUploadedTracks,
  updateUploadedTrack as updateUploadedTrackApi,
} from "@lib/music-tree-api-service/uploaded-track";
import { useAuthenticatedApi } from "@hooks/useAuthenticatedApi";
const UploadedTrackContext = createContext();

export const useUploadedTracks = () => {
  const context = useContext(UploadedTrackContext);
  if (!context) {
    throw new Error("useUploadedTracks must be used within an UploadedTrackProvider");
  }
  return context;
};

export const UploadedTrackProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const authenticatedApi = useAuthenticatedApi(listUploadedTracks);

  const {
    data: uploadedTracks = [],
    loading,
    error,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: async () => {
      const result = await authenticatedApi(1, 50);
      console.log("UploadedTrackProvider", result);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data.results;
    },
  });

  const updateUploadedTrack = useMutation({
    mutationFn: useAuthenticatedApi(updateUploadedTrackApi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const value = {
    uploadedTracks,
    updateUploadedTrack,
    error,
    loading,
    refreshTracks: () => queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] }),
  };

  return <UploadedTrackContext.Provider value={value}>{children}</UploadedTrackContext.Provider>;
};

UploadedTrackProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
