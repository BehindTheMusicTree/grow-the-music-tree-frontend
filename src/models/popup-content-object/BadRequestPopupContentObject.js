import PopupContentObject from "./PopupContentObject";

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor(operationErrors) {
    super("An error occurred");
    this.message = "BadRequest";
    this.operationErrors = operationErrors;
  }
}
