import { ErrorCode } from "./app-error-codes";

export enum AppErrorType {
  NETWORK = "NETWORK",
  API = "API",
  AUTH = "AUTH",
  CLIENT = "CLIENT",
  SERVER = "SERVER",
}

export function getErrorTypeFromCode(code: ErrorCode): AppErrorType {
  if (code.startsWith("NET")) {
    return AppErrorType.NETWORK;
  } else if (code.startsWith("API")) {
    return AppErrorType.API;
  } else if (code.startsWith("AUTH")) {
    return AppErrorType.AUTH;
  } else if (code.startsWith("CLIENT")) {
    return AppErrorType.CLIENT;
  } else if (code.startsWith("SERVER")) {
    return AppErrorType.SERVER;
  } else {
    throw Error("Unknown error code");
  }
}
