import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const PlayerTrackObjectContext = createContext();

export function PlayerTrackObjectProvider({ children }) {
  const [playerTrackObject, setPlayerTrackObject] = useState(null);

  return (
    <PlayerTrackObjectContext.Provider value={{ playerTrackObject, setPlayerTrackObject }}>
      {children}
    </PlayerTrackObjectContext.Provider>
  );
}

PlayerTrackObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
