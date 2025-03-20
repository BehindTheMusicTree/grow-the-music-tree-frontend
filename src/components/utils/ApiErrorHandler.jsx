import { useEffect } from "react";
import { usePopup } from "../../contexts/popup/usePopup";
import ApiService from "../../utils/ApiService";
import RequestError from "../../utils/errors/RequestError";
import CorsError from "../../utils/errors/CorsError";
import ApiErrorPopupContentObject from "../../models/popup-content-object/ApiErrorPopupContentObject";
import CorsErrorPopupContentObject from "../../models/popup-content-object/CorsErrorPopupContentObject";

const ApiErrorHandler = ({ children }) => {
  const { showPopup } = usePopup();

  useEffect(() => {
    const unsubscribe = ApiService.onError((error) => {
      if (error instanceof RequestError) {
        let popupContentObject;

        if (error instanceof CorsError) {
          // Create specific CORS error popup content
          popupContentObject = new CorsErrorPopupContentObject(error.requestErrors[0]);
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
