"use client";

import { createContext, useState, useContext, ReactNode } from "react";

interface GenreGettingAssignedNewParentContextType {
  genreGettingAssignedNewParent: {
    uuid: string;
    name: string;
    criteria?: {
      uuid: string;
    };
  } | null;
  setGenreGettingAssignedNewParent: (
    genre: {
      uuid: string;
      name: string;
      criteria?: {
        uuid: string;
      };
    } | null
  ) => void;
}

export const GenreGettingAssignedNewParentContext = createContext<GenreGettingAssignedNewParentContextType | null>(
  null
);

export function useGenreGettingAssignedNewParent() {
  const context = useContext(GenreGettingAssignedNewParentContext);
  if (!context) {
    throw new Error("useGenreGettingAssignedNewParent must be used within a GenreGettingAssignedNewParentProvider");
  }
  return context;
}

interface GenreGettingAssignedNewParentProviderProps {
  children: ReactNode;
}

export function GenreGettingAssignedNewParentProvider({ children }: GenreGettingAssignedNewParentProviderProps) {
  const [genreGettingAssignedNewParent, setGenreGettingAssignedNewParent] = useState<{
    uuid: string;
    name: string;
    criteria?: {
      uuid: string;
    };
  } | null>(null);

  return (
    <GenreGettingAssignedNewParentContext.Provider
      value={{
        genreGettingAssignedNewParent,
        setGenreGettingAssignedNewParent,
      }}
    >
      {children}
    </GenreGettingAssignedNewParentContext.Provider>
  );
}
