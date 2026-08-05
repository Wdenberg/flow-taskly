import { ERROR_MESSAGES } from "./messages";

export class AppError extends Error {
  readonly status: number | undefined;
  readonly details: unknown;
  readonly code?: string;
  readonly isAuthError?: boolean;
  readonly isNetworkError?: boolean;

  constructor(message: string, status?: number, details?: unknown, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
    this.code = code;
    this.isAuthError = false;
    this.isNetworkError = false;
  }

  static fromError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new AppError(error.message, 500);
    return new AppError(ERROR_MESSAGES.HTTP.GENERIC, 500);
  }
}

interface ApiErrorShape {
  message?: string | string[];
  error?: string;
  errors?: Record<string, string[]>;
}

export function mapHttpError(status: number | undefined, data: unknown): AppError {
  const payload = (data ?? {}) as ApiErrorShape;

  let message: string | undefined;
  if (Array.isArray(payload.message)) message = payload.message.join(", ");
  else if (typeof payload.message === "string") message = payload.message;
  else if (typeof payload.error === "string") message = payload.error;
  else if (payload.errors) message = Object.values(payload.errors).flat().join(", ");

  if (!message) {
    if (status === 401) message = ERROR_MESSAGES.AUTH.SESSION_EXPIRED;
    else if (status === 403) message = "Você não tem permissão para essa ação.";
    else if (status === 404) message = ERROR_MESSAGES.HTTP.NOT_FOUND;
    else if (status && status >= 500) message = ERROR_MESSAGES.HTTP.SERVER_ERROR;
    else if (!status) message = ERROR_MESSAGES.NETWORK.ERROR;
    else message = ERROR_MESSAGES.HTTP.GENERIC;
  }

  const error = new AppError(message, status, data);
  if (status === 401 || status === 403) {
    error.isAuthError = true;
    error.code = "AUTH_SESSION_EXPIRED";
  }
  if (!status) {
    error.isNetworkError = true;
    error.code = "NETWORK_ERROR";
  }
  return error;
}
