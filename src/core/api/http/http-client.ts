import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "../config/api.config";
import { AppError, classifyAuthError, mapHttpError } from "@/core/errors/app-error";
import { ERROR_MESSAGES } from "@/core/errors/messages";
import { isTokenExpired, sanitizeToken } from "@/core/utils/token";

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

let getToken: TokenGetter = () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

export function configureHttpAuth(options: {
  getToken: TokenGetter;
  onUnauthorized: UnauthorizedHandler;
}) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // a API hospedada no Render "acorda" devagar no primeiro acesso
});

// Rotas públicas que não exigem token (login/register passam pelo proxy).
function isPublicRoute(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/auth/login") || url.includes("/auth/register");
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isPublicRoute(config.url)) {
      config.headers.delete?.("Authorization");
      return config;
    }

    // Sempre lê o token na hora da requisição (sem cache em memória).
    const token = sanitizeToken(getToken());

    // Token ausente ou inválido — bloqueia a chamada antes de sair.
    if (!token) {
      const error = new AppError(
        ERROR_MESSAGES.AUTH.INVALID_TOKEN,
        401,
        undefined,
        "AUTH_INVALID_TOKEN",
      );
      error.isAuthError = true;
      onUnauthorized();
      return Promise.reject(error);
    }

    // Expiração proativa: não desperdiça uma ida ao servidor com token vencido.
    if (isTokenExpired(token)) {
      const error = new AppError(ERROR_MESSAGES.AUTH.TOKEN_EXPIRED, 401, undefined, "TOKEN_EXPIRED");
      error.isAuthError = true;
      onUnauthorized();
      return Promise.reject(error);
    }

    config.headers.set?.("Authorization", `Bearer ${token}`);

    if (import.meta.env.DEV) {
      console.debug(
        `[http] ${config.method?.toUpperCase()} ${config.url} · Authorization: Bearer ${token.slice(0, 12)}…(${token.length})`,
      );
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

function isEmptyBody(data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (typeof data === "string") return data.trim() === "";
  if (typeof data === "object") return Object.keys(data as object).length === 0;
  return false;
}

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // A API (Spring Security) responde 403 com corpo vazio para token ausente,
    // inválido ou expirado — tratamos como sessão expirada, igual ao 401.
    const sessionExpired = status === 401 || (status === 403 && isEmptyBody(data) && Boolean(getToken()));

    if (sessionExpired) {
      onUnauthorized();
      const appError = classifyAuthError(401, { message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED });
      if (import.meta.env.DEV) {
        console.debug("[http] Sessão expirada detectada:", appError.getDiagnosticInfo());
      }
      return Promise.reject(appError);
    }

    if (status === 401 || status === 403) {
      const appError = classifyAuthError(status, data);
      if (appError.code === "TOKEN_EXPIRED" || appError.code === "TOKEN_INVALID" || appError.code === "SESSION_NOT_FOUND") {
        onUnauthorized();
      }
      if (import.meta.env.DEV) {
        console.debug(`[http] Erro de autenticação (${status}):`, appError.getDiagnosticInfo());
      }
      return Promise.reject(appError);
    }

    return Promise.reject(mapHttpError(status, data));
  },
);
