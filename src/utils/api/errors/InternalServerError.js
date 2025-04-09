import RequestError from "./RequestError";

export default class InternalServerError extends RequestError {
  constructor() {
    super("InternalServerError", 500, null, null);
  }
}
