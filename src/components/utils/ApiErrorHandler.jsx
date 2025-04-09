import { useEffect, useRef } from "react";
import { usePopup } from "@contexts/popup/usePopup";
import ApiService from "@utils/api/ApiService";
import RequestError from "@utils/errors/RequestError";
import ConnectivityError from "@utils/errors/ConnectivityError";
import UnauthorizedRequestError from "@utils/errors/UnauthorizedRequestError";
import ApiErrorPopupContentObject from "@models/popup-content-object/ApiErrorPopupContentObject";
import ConnectivityErrorPopupContentObject from "@models/popup-content-object/ConnectivityErrorPopupContentObject";
import SpotifyAuthErrorPopupContentObject from "@models/popup-content-object/SpotifyAuthErrorPopupContentObject";

const ApiErrorHandler = ({ children }) => {
  const { showPopup } = usePopup();
  const hasShownConnectivityErrorRef = useRef(false);

  useEffect(() => {
    const unsubscribe = ApiService.onError((error) => {
      console.log("[ApiErrorHandler] Handling error:", error);
      let popupContentObject;

      if (error instanceof ConnectivityError) {
        // Show connectivity error only once
        if (!hasShownConnectivityErrorRef.current) {
          hasShownConnectivityErrorRef.current = true;
          popupContentObject = new ConnectivityErrorPopupContentObject(error);
        }
      } else if (error instanceof UnauthorizedRequestError) {
        // Spotify authentication error - show non-dismissable popup
        popupContentObject = new SpotifyAuthErrorPopupContentObject(error);
      } else if (error instanceof RequestError) {
        if (error.statusCode === 404) {
          // Server not found or endpoint doesn't exist
          popupContentObject = new ConnectivityErrorPopupContentObject({
            message: "Server or endpoint not found",
            url: error.url,
            details: {
              type: "server_not_found",
              message: "The server or endpoint you're trying to reach is not available",
              expectedUrl: error.url,
            },
          });
        } else if ([400, 500].includes(error.statusCode)) {
          popupContentObject = new ApiErrorPopupContentObject();
        }
      }

      if (popupContentObject) {
        console.log("[ApiErrorHandler] Showing popup:", popupContentObject);
        showPopup(popupContentObject);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showPopup]);

  return children;
};

export default ApiErrorHandler;
