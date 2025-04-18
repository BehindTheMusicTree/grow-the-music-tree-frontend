"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  listUploadedTracks as listUploadedTracksApi,
  uploadTrack as uploadTrackApi,
  updateUploadedTrack as updateUploadedTrackApi,
} from "@lib/api-service-service/uploaded-track";

const UploadedTrackContext = createContext();

export function useUploadedTracks() {
  const context = useContext(UploadedTrackContext);
  if (!context) {
    throw new Error("useUploadedTracks must be used within an UploadedTrackProvider");
  }
  return context;
}

export function UploadedTrackProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data: uploadedTracks = [],
    loading,
    error,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: listUploadedTracksApi,
  });

  const uploadTrack = useMutation({
    mutationFn: async (formData) => {
      return uploadTrackApi(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const updateUploadedTrack = useMutation({
    mutationFn: async ({ uploadedTrackUuid, uploadedTrackData }) => {
      return updateUploadedTrackApi(uploadedTrackUuid, uploadedTrackData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  return (
    <UploadedTrackContext.Provider
      value={{
        uploadedTracks,
        error,
        loading,
        uploadTrack,
        updateUploadedTrack,
        refreshTracks: () => queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] }),
      }}
    >
      {children}
    </UploadedTrackContext.Provider>
  );
}

UploadedTrackProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
