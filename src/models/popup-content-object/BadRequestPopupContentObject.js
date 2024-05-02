import PopupContentObject from './PopupContentObject';

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor(title, message) {
    super(title);
    this.message = message;
  }
}