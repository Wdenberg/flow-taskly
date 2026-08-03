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

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) onUnauthorized();
    return Promise.reject(mapHttpError(status, error.response?.data));
  },
);
