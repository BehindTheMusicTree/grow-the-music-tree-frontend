"use client";

import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

export const GenreGettingAssignedNewParentContext = createContext();

export function useGenreGettingAssignedNewParent() {
  const context = useContext(GenreGettingAssignedNewParentContext);
  if (!context) {
    throw new Error("useGenreGettingAssignedNewParent must be used within a GenreGettingAssignedNewParentProvider");
  }
  return context;
}

export function GenreGettingAssignedNewParentProvider({ children }) {
  const [genreGettingAssignedNewParent, setGenreGettingAssignedNewParent] = useState(null);

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

GenreGettingAssignedNewParentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
