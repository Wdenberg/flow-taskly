export class AppError extends Error {
  readonly status: number | undefined;
  readonly details: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
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
    if (status === 401) message = "Sessão expirada. Faça login novamente.";
    else if (status === 403) message = "Você não tem permissão para essa ação.";
    else if (status === 404) message = "Recurso não encontrado.";
    else if (status && status >= 500) message = "O servidor está indisponível. Tente novamente.";
    else if (!status) message = "Não foi possível conectar ao servidor.";
    else message = "Algo deu errado. Tente novamente.";
  }

  return new AppError(message, status, data);
}
