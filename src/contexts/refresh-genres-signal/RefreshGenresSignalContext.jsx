import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const RefreshGenresSignalContext = createContext();

export function RefreshGenresSignalProvider({ children }) {
  const [refreshGenresSignal, setRefreshGenresSignal] = useState(0);

  return (
    <RefreshGenresSignalContext.Provider value={{ refreshGenresSignal, setRefreshGenresSignal }}>
      {children}
    </RefreshGenresSignalContext.Provider>
  );
}

RefreshGenresSignalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
