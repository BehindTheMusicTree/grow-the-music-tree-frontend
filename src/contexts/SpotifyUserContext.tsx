"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { retrieveSpotifyUser as retrieveSpotifyUserApi, SpotifyUser } from "@/lib/music-tree-api-service/spotify-user";

interface SpotifyUserContextType {
  spotifyUser: SpotifyUser | null;
  isSpotifyUserLoading: boolean;
}

const SpotifyUserContext = createContext<SpotifyUserContextType | null>(null);

export const useSpotifyUser = () => {
  const context = useContext(SpotifyUserContext);
  if (!context) {
    throw new Error("useSpotifyUser must be used within a SpotifyUserProvider");
  }
  return context;
};

interface SpotifyUserProviderProps {
  children: ReactNode;
}

export const SpotifyUserProvider = ({ children }: SpotifyUserProviderProps) => {
  const retrieveSpotifyUser = useAuthenticatedApi<SpotifyUser>(retrieveSpotifyUserApi);
  const { data: spotifyUser, isLoading: isSpotifyUserLoading } = useQuery({
    queryKey: ["spotifyUser"],
    queryFn: async () => {
      const response = await retrieveSpotifyUser();
      if (!response.success) {
        throw new Error(response.error?.message);
      }
      return response.data;
    },
  });

  const value: SpotifyUserContextType = {
    spotifyUser: spotifyUser || null,
    isSpotifyUserLoading,
  };
  return <SpotifyUserContext.Provider value={value}>{children}</SpotifyUserContext.Provider>;
};
