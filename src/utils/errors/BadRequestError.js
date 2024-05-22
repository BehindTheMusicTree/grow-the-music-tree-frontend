export class BadRequestError extends Error {
  constructor(requestErrors, entityLabel) {
    super(JSON.stringify(requestErrors));
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.requestErrors = Array.isArray(requestErrors) ? requestErrors : [requestErrors];
    this.entityLabel = entityLabel;
  }
}
