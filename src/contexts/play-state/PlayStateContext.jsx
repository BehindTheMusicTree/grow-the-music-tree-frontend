import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { PLAY_STATES } from "../../constants";

export const PlayStateContext = createContext();

export function PlayStateProvider({ children }) {
  const [playState, setPlayState] = useState(PLAY_STATES.PLAYING);

  return <PlayStateContext.Provider value={{ playState, setPlayState }}>{children}</PlayStateContext.Provider>;
}

PlayStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
