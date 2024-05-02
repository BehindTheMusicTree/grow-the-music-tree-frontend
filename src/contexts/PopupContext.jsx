import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const PopupContext = createContext();

export function PopupProvider({ children }) {
    const [popupContentObject, setPopupObject] = useState(null);

    const showPopup = (object) => {
        setPopupObject(object);
    };

    const hidePopup = () => {
        setPopupObject(null);
    };

    return (
        <PopupContext.Provider value={{ popupContentObject, showPopup, hidePopup }}>
            {children}
        </PopupContext.Provider>
    );
}

PopupProvider.propTypes = {
    children: PropTypes.node.isRequired,
}