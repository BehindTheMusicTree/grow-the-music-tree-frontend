import { usePopup } from '../../contexts/usePopup';

import BadRequestPopup from './BadRequestPopup';


export default function Popup() {
  const { popupObject, hidePopup } = usePopup();

  if (!popupObject) {
    return null;
  }

  let Component;
  switch (popupObject.type) {
    case 'BadRequestError':
      Component = BadRequestPopup;
      break;
    // case 'type2':
    //   Component = ComponentType2;
    //   break;
    // Ajoutez d'autres cas au besoin
    default:
      Component = null;
  }

  return (
    <div className="popup">
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg max-w-md w-full relative">
                {Component && <Component badRequestPopupObject={popupObject} />}
                <button onClick={hidePopup}>Fermer</button>
            </div>
        </div>
    </div>
  );
}