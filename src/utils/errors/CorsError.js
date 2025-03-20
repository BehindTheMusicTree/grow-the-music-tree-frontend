import RequestError from "./RequestError";

export default class CorsError extends RequestError {
  constructor(requestErrorsObj, entityLabel) {
    super("CorsError", 0, entityLabel, requestErrorsObj);

    console.error("CORS Error Details:", requestErrorsObj);
  }
}