import { httpClient } from "@/core/api/http/http-client";
import { API_ENDPOINTS } from "@/core/api/config/api.config";
import type {
  AuthResponseDTO,
  LoginCredentials,
  RegisterCredentials,
} from "@/core/types/auth";

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponseDTO>;
  register(credentials: RegisterCredentials): Promise<AuthResponseDTO>;
}

export const authRepository: IAuthRepository = {
  async login(credentials) {
    const { data } = await httpClient.post<AuthResponseDTO>(
      API_ENDPOINTS.auth.login,
      credentials,
    );
    return data;
  },
  async register(credentials) {
    const { data } = await httpClient.post<AuthResponseDTO>(
      API_ENDPOINTS.auth.register,
      credentials,
    );
    return data;
  },
};
