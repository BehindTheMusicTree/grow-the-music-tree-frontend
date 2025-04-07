import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const PopupContext = createContext();

export function PopupProvider({ children }) {
  const [popupContentObject, setPopupContentObject] = useState();

  const showPopup = (popupContentObject) => {
    setPopupContentObject(popupContentObject);
  };

  const hidePopup = () => {
    setPopupContentObject(null);
  };

  return <PopupContext.Provider value={{ popupContentObject, showPopup, hidePopup }}>{children}</PopupContext.Provider>;
}

PopupProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PopupProvider;
