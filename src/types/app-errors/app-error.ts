import { ErrorCode, ErrorMessages } from "./app-error-codes";

export default class AppError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(ErrorMessages[code]);
  }
}
