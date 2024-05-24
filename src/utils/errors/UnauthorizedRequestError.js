import RequestError from "./RequestError";

export default class UnauthorizedRequestError extends RequestError {
  constructor() {
    super("UnauthorizedRequestError", 401, null, null);
  }
}
