import { usePopup } from "../../contexts/usePopup";

import BadRequestErrorView from "./child/BadRequestPopupChild";
import LibTrackEdition from "./child/LibTrackEditionPopupChild";

export default function Popup() {
  const { popupContentObject, hidePopup } = usePopup();

  if (!popupContentObject) {
    return null;
  }

  let PopupChild;
  switch (popupContentObject.constructor.name) {
    case "BadRequestPopupContentObject":
      PopupChild = BadRequestErrorView;
      break;
    case "LibTrackEditionPopupContentObject":
      PopupChild = LibTrackEdition;
      break;
    default:
      PopupChild = null;
  }

  return (
    <div className="popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-3 rounded-lg max-w-xl w-full relative">
        <div className="flex justify-between pl-2 mb-1">
          <h2>{popupContentObject.title}</h2>
          <div className="flex flex-col items-start justify-start h-full cursor-pointer" onClick={hidePopup}>
            &#10005;
          </div>
        </div>
        {PopupChild && <PopupChild popupContentObject={popupContentObject} hidePopup={hidePopup} />}
      </div>
    </div>
  );
}
