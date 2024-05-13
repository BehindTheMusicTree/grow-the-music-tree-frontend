import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const PlaylistPlayObjectContext = createContext();

export function PlaylistPlayObjectProvider({ children }) {
  const [playlistPlayObject, setPlaylistPlayObject] = useState(null);

  return (
    <PlaylistPlayObjectContext.Provider value={{ playlistPlayObject, setPlaylistPlayObject }}>
      {children}
    </PlaylistPlayObjectContext.Provider>
  );
}

PlaylistPlayObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
