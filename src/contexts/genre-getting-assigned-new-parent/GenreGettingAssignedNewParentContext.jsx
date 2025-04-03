import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const GenreGettingAssignedNewParentContext = createContext();

export function GenreGettingAssignedNewParentProvider({ children }) {
  const [genreUuidGettingAssignedNewParent, setGenreUuidGettingAssignedNewParent] = useState(null);
  const [forbiddenNewParentsUuids, setForbiddenNewParentsUuids] = useState(null);

  const setGenreGettingAssignedNewParent = (genre) => {
    if (!genre) {
      setForbiddenNewParentsUuids(null);
      setGenreUuidGettingAssignedNewParent(null);
    } else {
      setForbiddenNewParentsUuids([
        genre.uuid,
        genre.parent.uuid,
        ...genre.descendants.map((descendantWithDegree) => descendantWithDegree.descendant.uuid),
      ]);
      setGenreUuidGettingAssignedNewParent(genre.uuid);
    }
  };

  return (
    <GenreGettingAssignedNewParentContext.Provider
      value={{ forbiddenNewParentsUuids, genreUuidGettingAssignedNewParent, setGenreGettingAssignedNewParent }}
    >
      {children}
    </GenreGettingAssignedNewParentContext.Provider>
  );
}

GenreGettingAssignedNewParentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
