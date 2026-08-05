import axios, { AxiosError, type AxiosInstance } from "axios";

import { API_BASE_URL } from "../config/api.config";
import { mapHttpError } from "@/core/errors/app-error";

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

httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set?.("Authorization", `Bearer ${token}`);
  }
  return config;
});

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
        mapHttpError(401, { message: "Sua sessão expirou. Faça login novamente." }),
      );
    }

    return Promise.reject(mapHttpError(status, data));
  },
);
