import { usePopup } from "@/contexts/PopupContext";

import InvalidInputPopupChild from "./child/InvalidInputPopupChild";
import UploadedTrackEditionPopupChild from "./child/UploadedTrackEditionPopupChild";
import TrackUploadingPopupChild from "./child/TrackUploadPopupChild";
import ApiErrorPopupChild from "./child/ApiErrorPopupChild";
import ConnectivityErrorPopupChild from "./child/ConnectivityErrorPopupChild";
import GenreDeletionPopupChild from "./child/GenreDeletionPopupChild";
import SpotifyAuthPopupChild from "./child/SpotifyAuthPopupChild";
import SpotifyAuthErrorPopupChild from "./child/SpotifyAuthErrorPopupChild";

export default function Popup() {
  const { popupContentObject, hidePopup } = usePopup();

  let PopupChild;
  switch (popupContentObject.type) {
    case "InvalidInputContentObject":
      PopupChild = InvalidInputPopupChild;
      break;
    case "UploadedTrackEditionPopupContentObject":
      PopupChild = UploadedTrackEditionPopupChild;
      break;
    case "TrackUploadPopupContentObject":
      PopupChild = TrackUploadingPopupChild;
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
    case "spotify-auth-error":
      PopupChild = SpotifyAuthErrorPopupChild;
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
