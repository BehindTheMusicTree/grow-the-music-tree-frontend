import { useEffect } from "react";
import { usePopup } from "../../contexts/popup/usePopup";
import ApiService from "../../utils/ApiService";
import RequestError from "../../utils/errors/RequestError";
import ConnectivityError from "../../utils/errors/ConnectivityError";
import ApiErrorPopupContentObject from "../../models/popup-content-object/ApiErrorPopupContentObject";
import ConnectivityErrorPopupContentObject from "../../models/popup-content-object/ConnectivityErrorPopupContentObject";

const ApiErrorHandler = ({ children }) => {
  const { showPopup } = usePopup();

  useEffect(() => {
    const unsubscribe = ApiService.onError((error) => {
      if (error instanceof RequestError) {
        let popupContentObject;

        if (error instanceof ConnectivityError) {
          // Create specific connectivity error popup content
          popupContentObject = new ConnectivityErrorPopupContentObject(error.requestErrors[0]);
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
  }, []);

  return children;
};

export default ApiErrorHandler;
