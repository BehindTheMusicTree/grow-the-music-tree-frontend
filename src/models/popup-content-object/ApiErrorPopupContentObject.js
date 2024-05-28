import PopupContentObject from "./PopupContentObject";

export default class ApiErrorPopupContentObject extends PopupContentObject {
  constructor() {
    super("An error occurred");
    this.message =
      "We are sorry, an error occurred. Please try again later. If the problem persists, please contact " +
      "us at the following address: andreas.garcia@bodzify.com";
  }
}
