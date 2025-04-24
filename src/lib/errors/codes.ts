export enum NetworkError {
  OFFLINE = "NET1000",
  TIMEOUT = "NET1001",
  ERROR = "NET1002",
  FETCH_ERROR = "NET1003",
}

export enum ApiError {
  UNAVAILABLE = "API2000",
  RATE_LIMIT = "API2001",
  AUTH_ERROR = "API2002",
  INVALID_RESPONSE = "API2003",
}

export enum ServiceError {
  SPOTIFY = "SVC3000",
  YOUTUBE = "SVC3001",
  APPLE_MUSIC = "SVC3002",
}

export enum DataError {
  PARSE_ERROR = "DAT4000",
  VALIDATION_ERROR = "DAT4001",
}

export enum GeneralError {
  UNKNOWN = "GEN5000",
  OPERATION_FAILED = "GEN5001",
}

export type ConnectivityErrorCode = NetworkError | ApiError | ServiceError | DataError | GeneralError;

export const ErrorMessages: Record<NetworkError | ApiError | ServiceError | DataError | GeneralError, string> = {
  [NetworkError.OFFLINE]: "Network connection unavailable",
  [NetworkError.TIMEOUT]: "Request timed out",
  [NetworkError.ERROR]: "Network error occurred",
  [NetworkError.FETCH_ERROR]: "Failed to fetch data",
  [ApiError.UNAVAILABLE]: "Service temporarily unavailable",
  [ApiError.RATE_LIMIT]: "Too many requests, please try again later",
  [ApiError.AUTH_ERROR]: "Authentication failed",
  [ApiError.INVALID_RESPONSE]: "Invalid response from server",
  [ServiceError.SPOTIFY]: "Spotify service error",
  [ServiceError.YOUTUBE]: "YouTube service error",
  [ServiceError.APPLE_MUSIC]: "Apple Music service error",
  [DataError.PARSE_ERROR]: "Failed to parse data",
  [DataError.VALIDATION_ERROR]: "Invalid data format",
  [GeneralError.UNKNOWN]: "An unexpected error occurred",
  [GeneralError.OPERATION_FAILED]: "Operation failed",
};
