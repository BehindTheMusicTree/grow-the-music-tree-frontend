export class BadRequestError extends Error {
  constructor(requestErrors) {
    super(JSON.stringify(requestErrors));
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.requestErrors = Array.isArray(requestErrors) ? requestErrors : [requestErrors];
  }
}
