import RequestError from "./RequestError";

export default class BadRequestError extends RequestError {
  constructor(requestErrorsObj, entityLabel) {
    super("BadRequestError", 400, entityLabel, requestErrorsObj);
  }
}
