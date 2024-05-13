import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const PlayStateContext = createContext();

export function PlayStateProvider({ children }) {
  const [playState, setPlayState] = useState(null);

  return <PlayStateContext.Provider value={{ playState, setPlayState }}>{children}</PlayStateContext.Provider>;
}

PlayStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
