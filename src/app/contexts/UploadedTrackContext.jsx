"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@contexts/AuthContext";

const UploadedTrackContext = createContext();

export function useUploadedTracks() {
  const context = useContext(UploadedTrackContext);
  if (!context) {
    throw new Error("useUploadedTracks must be used within an UploadedTrackProvider");
  }
  return context;
}

export function UploadedTrackProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const {
    data: uploadedTracks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}uploaded-tracks`);
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded tracks");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const addTrackMutation = useMutation({
    mutationFn: async (trackData) => {
      const response = await fetch(`${baseUrl}uploaded-tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackData),
      });
      if (!response.ok) {
        throw new Error("Failed to add track");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({ uploadedTrackUuid, uploadedTrackData }) => {
      const response = await fetch(`${baseUrl}uploaded-tracks/${uploadedTrackUuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadedTrackData),
      });
      if (!response.ok) {
        throw new Error("Failed to update track");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async (uploadedTrackUuid) => {
      const response = await fetch(`${baseUrl}uploaded-tracks/${uploadedTrackUuid}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete track");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const addTrack = async (trackData) => {
    return addTrackMutation.mutateAsync(trackData);
  };

  const updateTrack = async (uploadedTrackUuid, uploadedTrackData) => {
    return updateTrackMutation.mutateAsync({ uploadedTrackUuid, uploadedTrackData });
  };

  const deleteTrack = async (uploadedTrackUuid) => {
    return deleteTrackMutation.mutateAsync(uploadedTrackUuid);
  };

  const getTrack = (uploadedTrackUuid) => {
    return uploadedTracks.find((track) => track.uuid === uploadedTrackUuid);
  };

  const getTracks = () => {
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
        deleteTrack,
        getTrack,
        getTracks,
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
