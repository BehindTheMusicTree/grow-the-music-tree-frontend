import { usePopup } from "../../contexts/usePopup";

import BadRequestErrorView from "./BadRequestErrorView";
import LibTrackEdition from "./LibTrackEdition";

export default function Popup() {
  const { popupContentObject, hidePopup } = usePopup();

  if (!popupContentObject) {
    return null;
  }

  let Component;
  switch (popupContentObject.constructor.name) {
    case "BadRequestPopupContentObject":
      Component = BadRequestErrorView;
      break;
    case "LibTrackEditionPopupContentObject":
      Component = LibTrackEdition;
      break;
    default:
      Component = null;
  }

  return (
    <div className="popup">
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-3 rounded-lg max-w-md w-full relative">
          <div className="flex justify-between items-center mb-1">
            <h2>{popupContentObject.title}</h2>
            <div
              style={{
                cursor: "pointer",
              }}
              onClick={hidePopup}
            >
              &#10005;
            </div>
          </div>
          {Component && <Component popupContentObject={popupContentObject} />}
        </div>
      </div>
    </div>
  );
}
