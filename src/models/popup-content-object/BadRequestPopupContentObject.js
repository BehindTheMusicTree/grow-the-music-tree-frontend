import PopupContentObject from './PopupContentObject';

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor(operation, message) {
    super("Error while " + operation);
    
    const operationErrorsJsonPart = message.split('Operation error messages: ').pop();
    const operationErrorsObject = JSON.parse(operationErrorsJsonPart);
    this.operationErrors = Object.entries(operationErrorsObject).map(([name, errors]) => ({ name, errors }));
  }
}