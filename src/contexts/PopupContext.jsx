import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const PopupContext = createContext();

export function PopupProvider({ children }) {
    const [popupObject, setPopupObject] = useState(null);

    const showPopup = (object) => {
        setPopupObject(object);
    };

    const hidePopup = () => {
        setPopupObject(null);
    };

    return (
        <PopupContext.Provider value={{ popupObject, showPopup, hidePopup }}>
            {children}
        </PopupContext.Provider>
    );
}

PopupProvider.propTypes = {
    children: PropTypes.node.isRequired,
}