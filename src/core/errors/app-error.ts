import { ERROR_MESSAGES } from "./messages";

export type AuthErrorType =
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "PERMISSION_DENIED"
  | "SESSION_NOT_FOUND"
  | "AUTH_SESSION_EXPIRED"
  | "AUTH_INVALID_TOKEN";

export class AppError extends Error {
  readonly status: number | undefined;
  readonly details: unknown;
  code: string | undefined;
  isAuthError: boolean;
  isNetworkError: boolean;
  override readonly cause: unknown;

  constructor(
    message: string,
    status?: number,
    details?: unknown,
    code?: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
    this.code = code;
    this.isAuthError = false;
    this.isNetworkError = false;
    this.cause = cause;
  }


  static fromError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new AppError(error.message, 500, undefined, undefined, error);
    return new AppError(ERROR_MESSAGES.HTTP.GENERIC, 500);
  }

  getDiagnosticInfo(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      isAuthError: this.isAuthError,
      isNetworkError: this.isNetworkError,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
      stack: this.stack,
    };
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

export function classifyAuthError(status: number | undefined, data: unknown): AppError {
  const payload = (data ?? {}) as ApiErrorShape;
  const rawMessage = Array.isArray(payload.message)
    ? payload.message.join(", ")
    : typeof payload.message === "string"
      ? payload.message
      : typeof payload.error === "string"
        ? payload.error
        : "";

  const lower = rawMessage.toLowerCase();

  if (status === 401) {
    if (lower.includes("expir") || lower.includes("expired")) {
      return new AppError(ERROR_MESSAGES.AUTH.TOKEN_EXPIRED, 401, data, "TOKEN_EXPIRED", rawMessage);
    }
    if (lower.includes("invalid") || lower.includes("malformed") || lower.includes("formato")) {
      return new AppError(ERROR_MESSAGES.AUTH.TOKEN_INVALID, 401, data, "TOKEN_INVALID", rawMessage);
    }
    if (lower.includes("session") || lower.includes("sessão") || lower.includes("not found")) {
      return new AppError(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND, 401, data, "SESSION_NOT_FOUND", rawMessage);
    }
    return new AppError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED, 401, data, "AUTH_SESSION_EXPIRED", rawMessage);
  }

  if (status === 403) {
    if (lower.includes("permission") || lower.includes("denied") || lower.includes("acesso") || lower.includes("permissão")) {
      return new AppError(ERROR_MESSAGES.AUTH.PERMISSION_DENIED, 403, data, "PERMISSION_DENIED", rawMessage);
    }
    return new AppError("Você não tem permissão para esta ação.", 403, data, "PERMISSION_DENIED", rawMessage);
  }

  return mapHttpError(status, data);
}
