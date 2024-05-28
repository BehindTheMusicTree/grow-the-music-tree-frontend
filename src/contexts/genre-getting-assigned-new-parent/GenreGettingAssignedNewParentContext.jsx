import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const GenreGettingAssignedNewParentContext = createContext();

export function GenreGettingAssignedNewParentProvider({ children }) {
  const [genreUuidGettingAssignedNewParent, setGenreUuidGettingAssignedNewParent] = useState();

  return (
    <GenreGettingAssignedNewParentContext.Provider
      value={{ genreUuidGettingAssignedNewParent, setGenreUuidGettingAssignedNewParent }}
    >
      {children}
    </GenreGettingAssignedNewParentContext.Provider>
  );
}

GenreGettingAssignedNewParentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
