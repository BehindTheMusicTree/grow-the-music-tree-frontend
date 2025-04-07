import RequestError from "./RequestError";

export default class ConnectivityError extends RequestError {
  constructor(requestErrorsObj, entityLabel) {
    super("ConnectivityError", 0, entityLabel, requestErrorsObj);

    // Store connectivity issue type if provided
    if (requestErrorsObj && requestErrorsObj.details && requestErrorsObj.details.type) {
      this.connectivityType = requestErrorsObj.details.type;
    } else {
      this.connectivityType = "unknown";
    }

    console.error("Connectivity Error Details:", requestErrorsObj);
  }
}