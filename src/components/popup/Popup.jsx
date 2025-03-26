import { usePopup } from "../../contexts/popup/usePopup";

import BadRequestErrorPopupChild from "./child/BadRequestPopupChild";
import LibTrackEditionPopupChild from "./child/LibTrackEditionPopupChild";
import LibTrackUploadingPopupChild from "./child/LibTrackUploadPopupChild";
import ApiErrorPopupChild from "./child/ApiErrorPopupChild";
import ConnectivityErrorPopupChild from "./child/ConnectivityErrorPopupChild";

export default function Popup() {
  const { popupContentObject, hidePopup } = usePopup();

  let PopupChild;
  switch (popupContentObject.type) {
    case "BadRequestPopupContentObject":
      PopupChild = BadRequestErrorPopupChild;
      break;
    case "LibTrackEditionPopupContentObject":
      PopupChild = LibTrackEditionPopupChild;
      break;
    case "LibTrackUploadPopupContentObject":
      PopupChild = LibTrackUploadingPopupChild;
      break;
    case "ApiErrorPopupContentObject":
      PopupChild = ApiErrorPopupChild;
      break;
    case "ConnectivityErrorPopupContentObject":
      PopupChild = ConnectivityErrorPopupChild;
      break;
    case "CorsErrorPopupContentObject":
      // For backward compatibility, use the new component for old type
      PopupChild = ConnectivityErrorPopupChild;
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
        {PopupChild && <PopupChild popupContentObject={popupContentObject} hide={hidePopup} />}
      </div>
    </div>
  );
}
