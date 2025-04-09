import RequestError from "./RequestError";

export default class UnauthorizedRequestError extends RequestError {
  constructor(errorDetails = { message: "Authentication required" }) {
    super("UnauthorizedRequestError", 401, "auth", errorDetails);
  }
}
