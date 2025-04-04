import { usePopup } from "../../contexts/popup/usePopup";

import InvalidInputPopupChild from "./child/InvalidInputPopupChild";
import LibTrackEditionPopupChild from "./child/LibTrackEditionPopupChild";
import LibTrackUploadingPopupChild from "./child/LibTrackUploadPopupChild";
import ApiErrorPopupChild from "./child/ApiErrorPopupChild";
import ConnectivityErrorPopupChild from "./child/ConnectivityErrorPopupChild";
import GenreDeletionPopupChild from "./child/GenreDeletionPopupChild";
import SpotifyAuthPopupChild from "./child/SpotifyAuthPopupChild";

export default function Popup() {
  const { popupContentObject, hidePopup } = usePopup();

  let PopupChild;
  switch (popupContentObject.type) {
    case "InvalidInputContentObject":
      PopupChild = InvalidInputPopupChild;
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
    case "GenreDeletionPopupContentObject":
      PopupChild = GenreDeletionPopupChild;
      break;
    case "SpotifyAuthPopupContentObject":
      PopupChild = SpotifyAuthPopupChild;
      break;
    default:
      PopupChild = null;
  }

  // Determine proper width based on popup type
  const popupWidth =
    popupContentObject.type === "GenreDeletionPopupContentObject"
      ? "max-w-md" // More compact width for genre deletion
      : "max-w-xl"; // Default width for other popups

  return (
    <div className="popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`bg-white p-3 rounded-lg ${popupWidth} w-full relative`}>
        <div className="flex justify-between pl-2 mb-1">
          <h2>{popupContentObject.title}</h2>
          {popupContentObject.isDismissable !== false && (
            <div className="flex flex-col items-start justify-start h-full cursor-pointer" onClick={hidePopup}>
              &#10005;
            </div>
          )}
        </div>
        {PopupChild && <PopupChild popupContentObject={popupContentObject} hide={hidePopup} />}
      </div>
    </div>
  );
}
