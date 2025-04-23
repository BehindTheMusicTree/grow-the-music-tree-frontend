"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "@hooks/useAuthenticatedApi";
import { retrieveSpotifyUser as retrieveSpotifyUserApi } from "@lib/music-tree-api-service/spotify-user";

const SpotifyUserContext = createContext();

export const useSpotifyUser = () => {
  const context = useContext(SpotifyUserContext);
  if (!context) {
    throw new Error("useSpotifyUser must be used within a SpotifyUserProvider");
  }
  return context;
};

export const SpotifyUserProvider = ({ children }) => {
  const retrieveSpotifyUser = useAuthenticatedApi(retrieveSpotifyUserApi);
  const { data: spotifyUser, isLoading: isSpotifyUserLoading } = useQuery({
    queryKey: ["spotifyUser"],
    queryFn: async () => {
      const response = await retrieveSpotifyUser();
      return response.json();
    },
  });

  const value = {
    spotifyUser,
    isSpotifyUserLoading,
  };
  return <SpotifyUserContext.Provider value={value}>{children}</SpotifyUserContext.Provider>;
};
