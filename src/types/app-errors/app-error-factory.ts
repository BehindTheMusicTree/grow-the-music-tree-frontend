import { ErrorCode } from "./app-error-codes";
import { AppError, NetworkError, ApiError, AuthError, ClientError, ServerError } from "./app-error";

export function createAppError(code: ErrorCode): AppError {
  if (code.startsWith("NET")) {
    return new NetworkError(code);
  } else if (code.startsWith("API")) {
    return new ApiError(code);
  } else if (code.startsWith("AUTH")) {
    return new AuthError(code);
  } else if (code.startsWith("CLIENT")) {
    return new ClientError(code);
  } else if (code.startsWith("SERVER")) {
    return new ServerError(code);
  }
  return new AppError(code);
}
