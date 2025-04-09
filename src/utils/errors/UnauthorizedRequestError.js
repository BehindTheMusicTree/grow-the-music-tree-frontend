import RequestError from "./RequestError";

export default class UnauthorizedRequestError extends RequestError {
  constructor(message = "Unauthorized request") {
    super(message, 401);
    this.name = "UnauthorizedRequestError";
  }
}
