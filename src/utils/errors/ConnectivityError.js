import RequestError from "./RequestError";

export default class ConnectivityError extends RequestError {
  constructor(message = "Network connectivity error") {
    super(message);
    this.name = "ConnectivityError";
  }
}
