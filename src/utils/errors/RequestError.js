export default class RequestError extends Error {
  constructor(name, statusCode, entityLabel, requestErrorsObj) {
    super(JSON.stringify(requestErrorsObj));
    this.name = name;
    this.statusCode = statusCode;
    this.requestErrors = Array.isArray(requestErrorsObj) ? requestErrorsObj : [requestErrorsObj];
    this.entityLabel = entityLabel;
  }
}
