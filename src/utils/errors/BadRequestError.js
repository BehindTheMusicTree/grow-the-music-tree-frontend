import RequestError from "./RequestError";

export default class BadRequestError extends RequestError {
  constructor(message, requestErrors = []) {
    super(message);
    this.name = "BadRequestError";
    this.requestErrors = requestErrors;
  }
}
