import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

export const PopupContext = createContext();

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
}

export function PopupProvider({ children }) {
  const [popupContentObject, setPopupContentObject] = useState(null);

  const showPopup = (content) => {
    setPopupContentObject(content);
  };

  const hidePopup = () => {
    setPopupContentObject(null);
  };

  return (
    <PopupContext.Provider
      value={{
        popupContentObject,
        showPopup,
        hidePopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
}

PopupProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
