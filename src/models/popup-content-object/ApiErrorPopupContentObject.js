import PopupContentObject from "./PopupContentObject";
import config from "../../utils/config";

export default class ApiErrorPopupContentObject extends PopupContentObject {
  constructor() {
    super("An error occurred");
    this.message = `We are sorry, an error occurred. Please try again later.<br/>
    If the problem persists, please contact us at the following address: ${config.contactEmail}.<br/>
    If the problem still persists, pray for God or Willie Nelson.`;
  }
}
