"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUploadedTracks, updateUploadedTrack as updateUploadedTrackApi } from "@lib/api-service/uploaded-track";

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

  const {
    data: uploadedTracks = [],
    loading,
    error,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: listUploadedTracks,
  });

  const updateUploadedTrack = useMutation({
    mutationFn: async ({ uploadedTrackUuid, uploadedTrackData }) => {
      return updateUploadedTrackApi(uploadedTrackUuid, uploadedTrackData);
    },
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
