import { useEffect } from "react";
import { usePopup } from "@contexts/popup/usePopup";
import ApiService from "@utils/ApiService";
import RequestError from "@utils/errors/RequestError";
import ConnectivityError from "@utils/errors/ConnectivityError";
import UnauthorizedRequestError from "@utils/errors/UnauthorizedRequestError";
import ApiErrorPopupContentObject from "@models/popup-content-object/ApiErrorPopupContentObject";
import ConnectivityErrorPopupContentObject from "@models/popup-content-object/ConnectivityErrorPopupContentObject";
import SpotifyAuthErrorPopupContentObject from "@models/popup-content-object/SpotifyAuthErrorPopupContentObject";

const ApiErrorHandler = ({ children }) => {
  const { showPopup } = usePopup();

  useEffect(() => {
    const unsubscribe = ApiService.onError((error) => {
      if (error instanceof RequestError) {
        let popupContentObject;

        if (error instanceof ConnectivityError) {
          // Create specific connectivity error popup content
          popupContentObject = new ConnectivityErrorPopupContentObject(error.requestErrors[0]);
        } else if (error instanceof UnauthorizedRequestError) {
          // Spotify authentication error - show non-dismissable popup
          popupContentObject = new SpotifyAuthErrorPopupContentObject(error.requestErrors[0]);
        } else if ([400, 404, 500].includes(error.statusCode)) {
          popupContentObject = new ApiErrorPopupContentObject();
        }

        if (popupContentObject) {
          showPopup(popupContentObject);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showPopup]);

  return children;
};

export default ApiErrorHandler;
