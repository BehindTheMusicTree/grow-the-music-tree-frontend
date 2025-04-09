import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { UploadedTrackService } from "@utils/services";
import { useAuth } from "@contexts/AuthContext";

export const UploadedTrackContext = createContext();

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

  const {
    data: uploadedTracks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: () => UploadedTrackService.getUploadedTracks(),
    enabled: isAuthenticated,
  });

  const uploadTrackMutation = useMutation({
    mutationFn: ({ file, genreUuid, onProgress }) => UploadedTrackService.uploadTrack(file, genreUuid, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ uploadedTrackUuid, uploadedTrackData }) =>
      UploadedTrackService.putUploadedTrack(uploadedTrackUuid, uploadedTrackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });

  const postUploadedTrack = async (file, genreUuid, onProgress) => {
    return uploadTrackMutation.mutateAsync({ file, genreUuid, onProgress });
  };

  const updateUploadedTrack = async (uploadedTrackUuid, uploadedTrackData) => {
    return updateTrackMutation.mutateAsync({ uploadedTrackUuid, uploadedTrackData });
  };

  return (
    <UploadedTrackContext.Provider
      value={{
        uploadedTracks,
        error,
        isLoading,
        postUploadedTrack,
        updateUploadedTrack,
        refreshUploadedTracks: () => queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] }),
      }}
    >
      {children}
    </UploadedTrackContext.Provider>
  );
}

UploadedTrackProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
