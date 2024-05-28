import { useEffect } from "react";
import { usePopup } from "../../contexts/popup/usePopup";
import ApiService from "../../utils/ApiService";
import RequestError from "../../utils/errors/RequestError";
import BadRequestError from "../../utils/errors/BadRequestError";
import BadRequestPopupContentObject from "../../models/popup-content-object/BadRequestPopupContentObject";
import ApiErrorPopupContentObject from "../../models/popup-content-object/ApiErrorPopupContentObject";

const ApiErrorHandler = ({ children }) => {
  const { showPopup } = usePopup();

  useEffect(() => {
    const unsubscribe = ApiService.onError((error) => {
      if (error instanceof RequestError) {
        let popupContentObject;
        if (error instanceof BadRequestError) {
          popupContentObject = new BadRequestPopupContentObject(error.requestErrors);
        } else if (error.statusCode in [404, 500]) {
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
