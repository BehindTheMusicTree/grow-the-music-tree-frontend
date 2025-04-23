export enum ErrorCode {
  AUTH_REQUIRED = "AUTH_REQUIRED",
  NETWORK = "NETWORK",
  INTERNAL = "INTERNAL",
  BAD_REQUEST = "BAD_REQUEST",
}

const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: "Authentication is required to access this resource",
  [ErrorCode.NETWORK]: "Network error occurred. Please check your connection",
  [ErrorCode.INTERNAL]: "An internal server error occurred",
  [ErrorCode.BAD_REQUEST]: "Invalid request. Please check your input",
};

export function getMessage(code: ErrorCode): string {
  return errorMessages[code] || "An unknown error occurred";
}
