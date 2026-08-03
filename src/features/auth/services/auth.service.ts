import { AppError } from "@/core/errors/app-error";
import type {
  AuthResponseDTO,
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserDTO,
} from "@/core/types/auth";
import { authRepository, type IAuthRepository } from "../repositories/auth.repository";

function mapUser(dto: UserDTO | undefined, fallbackEmail: string, fallbackName?: string): User {
  return {
    id: String(dto?.id ?? dto?._id ?? fallbackEmail),
    name: dto?.name ?? fallbackName ?? fallbackEmail.split("@")[0] ?? fallbackEmail,
    email: dto?.email ?? fallbackEmail,
  };
}

function extractToken(dto: AuthResponseDTO): string {
  const token = dto.accessToken ?? dto.access_token ?? dto.token ?? dto.data?.token ?? dto.data?.accessToken;
  if (!token) {
    throw new AppError("Não foi possível recuperar o token de acesso.");
  }
  return token;
}

function toSession(dto: AuthResponseDTO, email: string, name?: string): AuthSession {
  const inlineUser: UserDTO | undefined = dto.email
    ? { ...(dto.id !== undefined ? { id: dto.id } : {}), ...(dto.name ? { name: dto.name } : {}), email: dto.email }
    : undefined;
  const userDto = dto.user ?? dto.data?.user ?? inlineUser;
  return { token: extractToken(dto), user: mapUser(userDto, email, name) };
}

export function createAuthService(repository: IAuthRepository = authRepository) {
  return {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
      const dto = await repository.login(credentials);
      return toSession(dto, credentials.email);
    },
    async register(credentials: RegisterCredentials): Promise<AuthSession | null> {
      const dto = await repository.register(credentials);
      try {
        return toSession(dto, credentials.email, credentials.name);
      } catch {
        // A API pode não retornar token no cadastro: nesse caso autenticamos em seguida.
        const login = await repository.login({
          email: credentials.email,
          password: credentials.password,
        });
        return toSession(login, credentials.email, credentials.name);
      }
    },
  };
}

export const authService = createAuthService();
