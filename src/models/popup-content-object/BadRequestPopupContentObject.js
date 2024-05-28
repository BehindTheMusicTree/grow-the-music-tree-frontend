import PopupContentObject from "./PopupContentObject";

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor() {
    super("An error occurred");
    this.message = "BadRequest";
  }
}
