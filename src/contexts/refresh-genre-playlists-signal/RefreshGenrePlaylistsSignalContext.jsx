import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const RefreshGenrePlaylistsSignalContext = createContext();

export function RefreshGenrePlaylistsSignalProvider({ children }) {
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignal] = useState(1);

  return (
    <RefreshGenrePlaylistsSignalContext.Provider
      value={{ refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignal }}
    >
      {children}
    </RefreshGenrePlaylistsSignalContext.Provider>
  );
}

RefreshGenrePlaylistsSignalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
