"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTracks, uploadTrack, updateTrack } from "@actions/uploaded-tracks";

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
  const { status } = useSession();

  const {
    data: uploadedTracks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: getTracks,
    enabled: status === "authenticated",
  });

  const addTrackMutation = useMutation({
    mutationFn: async (formData) => {
      return uploadTrack(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
    enabled: status === "authenticated",
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({ uploadedTrackUuid, uploadedTrackData }) => {
      return updateTrack(uploadedTrackUuid, uploadedTrackData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
    enabled: status === "authenticated",
  });

  const addTrack = async (formData) => {
    return addTrackMutation.mutateAsync(formData);
  };

  const updateTrack = async (uploadedTrackUuid, uploadedTrackData) => {
    return updateTrackMutation.mutateAsync({ uploadedTrackUuid, uploadedTrackData });
  };

  const retrieveTrack = (uploadedTrackUuid) => {
    return uploadedTracks.find((track) => track.uuid === uploadedTrackUuid);
  };

  const listTracks = () => {
    return uploadedTracks;
  };

  return (
    <UploadedTrackContext.Provider
      value={{
        uploadedTracks,
        error,
        isLoading,
        addTrack,
        updateTrack,
        retrieveTrack,
        listTracks,
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
