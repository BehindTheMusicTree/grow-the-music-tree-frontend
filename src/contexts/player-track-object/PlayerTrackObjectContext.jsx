import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const PlayerTrackObjectContext = createContext();

export function PlayerTrackObjectProvider({ children }) {
  const [playerTrackObject, setPlayerTrackObject] = useState(null);
  const setPlayState = (playState) => {
    setPlayerTrackObject((prev) => ({ ...prev, playState }));
  };

  return (
    <PlayerTrackObjectContext.Provider value={{ playerTrackObject, setPlayerTrackObject, setPlayState }}>
      {children}
    </PlayerTrackObjectContext.Provider>
  );
}

PlayerTrackObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
