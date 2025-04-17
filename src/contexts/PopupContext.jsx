import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Popup from "@components/ui/popup/Popup";

const PopupContext = createContext();

export function PopupProvider({ children }) {
  const [activePopup, setActivePopup] = useState(null);

  const showPopup = useCallback((type, content) => {
    setActivePopup({ type, content });
  }, []);

  const hidePopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}
      {activePopup && <Popup type={activePopup.type} content={activePopup.content} onClose={hidePopup} />}
    </PopupContext.Provider>
  );
}

PopupProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
}
