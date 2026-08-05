import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "../config/api.config";
import { mapHttpError, AppError } from "@/core/errors/app-error";
import { ERROR_MESSAGES } from "@/core/errors/messages";

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
  timeout: 30000,
});

// Garante um JWT puro: sem objeto JSON, sem prefixo "Bearer", sem "null"/"undefined".
function sanitizeToken(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let value = raw.trim();
  if (!value || value === "null" || value === "undefined") return null;
  if (value.startsWith("{") || value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (typeof parsed === "string") value = parsed.trim();
      else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        const nested = obj["token"] ?? obj["accessToken"] ?? obj["jwt"];
        if (typeof nested !== "string") return null;
        value = nested.trim();
      }
    } catch {
      return null;
    }
  }
  if (/^bearer\s+/i.test(value)) value = value.replace(/^bearer\s+/i, "").trim();
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

function isValidToken(token: string | null): boolean {
  return token !== null && token.length > 0;
}

// Rotas públicas que não exigem token (login/register passam pelo proxy).
function isPublicRoute(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/auth/login") || url.includes("/auth/register");
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Rotas públicas (login/register) não precisam de token.
    if (isPublicRoute(config.url)) {
      config.headers.delete?.("Authorization");
      return config;
    }

    // Sempre lê o token na hora da requisição (sem cache em memória).
    const token = sanitizeToken(getToken());

    // Token ausente, inválido ou vazio — bloqueia a chamada antes de sair.
    if (!isValidToken(token)) {
      const error = new AppError(ERROR_MESSAGES.AUTH.INVALID_TOKEN, 401);
      error.code = "AUTH_INVALID_TOKEN";
      error.isAuthError = true;
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
      return Promise.reject(
        mapHttpError(401, { message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED }),
      );
    }

    return Promise.reject(mapHttpError(status, data));
  },
);
