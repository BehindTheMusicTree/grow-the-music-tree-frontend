import PopupContentObject from "./PopupContentObject";
import config from "../../utils/config";

export default class ApiErrorPopupContentObject extends PopupContentObject {
  constructor() {
    super("An error occurred", "ApiErrorPopupContentObject");
    this.message = `We are sorry, an error occurred. Please try again later.<br/>
    If the problem persists, please contact us at the following address: 
    <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>.<br/>`;
  }
}
