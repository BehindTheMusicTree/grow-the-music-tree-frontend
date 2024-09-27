import PopupContentObject from "./PopupContentObject";

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor(operationErrors) {
    super("An error occurred", "BadRequestPopupContentObject");
    this.message = "BadRequest";
    this.operationErrors = operationErrors;
  }
}
