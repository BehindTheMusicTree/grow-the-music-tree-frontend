import { useEffect } from "react";
import { usePopup } from "../../contexts/popup/usePopup";
import ApiService from "../../utils/ApiService";
import RequestError from "../../utils/errors/RequestError";
import ApiErrorPopupContentObject from "../../models/popup-content-object/ApiErrorPopupContentObject";

const ApiErrorHandler = ({ children }) => {
  const { showPopup } = usePopup();

  useEffect(() => {
    const unsubscribe = ApiService.onError((error) => {
      if (error instanceof RequestError) {
        let popupContentObject;
        if ([400, 404, 500].includes(error.statusCode)) {
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
