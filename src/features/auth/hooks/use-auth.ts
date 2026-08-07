import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppError } from "@/core/errors/app-error";
import { ERROR_MESSAGES } from "@/core/errors/messages";
import type { LoginCredentials, RegisterCredentials } from "@/core/types/auth";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return ERROR_MESSAGES.HTTP.GENERIC;
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.logout);
  const hasValidToken = useAuthStore((state) => state.hasValidToken);
  const handleError = useAuthStore((state) => state.handleError);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutRef = useRef(clearSession);
  useEffect(() => {
    logoutRef.current = clearSession;
  }, [clearSession]);

  // Limpa o cache do React Query e leva o usuário para o login.
  const teardownSession = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    logoutRef.current();
    await navigate({ to: "/login", replace: true });
  }, [navigate, queryClient]);

  const teardownRef = useRef(teardownSession);
  useEffect(() => {
    teardownRef.current = teardownSession;
  }, [teardownSession]);

  // Listener para logout disparado em outro ponto do app ou em outra aba.
  useEffect(() => {
    const handleLogout = () => {
      void queryClient.cancelQueries().then(() => queryClient.clear());
      void navigate({ to: "/login", replace: true });
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate, queryClient]);

  // Sessão encerrada em outra aba (storage compartilhado).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "taskflow.auth") return;
      if (!useAuthStore.getState().hasValidToken()) {
        void teardownRef.current();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (session) => {
      setSession(session);
      toast.success(`Bem-vindo(a), ${session.user.name}!`);
      void navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      handleError(error);
      toast.error(errorMessage(error));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (session) => {
      if (session) {
        setSession(session);
        toast.success("Conta criada com sucesso!");
        void navigate({ to: "/dashboard" });
      }
    },
    onError: (error) => {
      handleError(error);
      toast.error(errorMessage(error));
    },
  });

  // Executa uma ação protegida, verificando o token antes e tratando erros de auth.
  const handleProtectedAction = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      if (!hasValidToken()) {
        const error = new AppError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED, 401, undefined, "AUTH_SESSION_EXPIRED");
        error.isAuthError = true;
        void teardownSession();
        throw error;
      }

      try {
        return await action();
      } catch (error) {
        if (error instanceof AppError && error.isAuthError) {
          handleError(error);
          void teardownSession();
        }
        throw error;
      }
    },
    [hasValidToken, handleError, teardownSession],
  );

  return {
    user,
    token,
    hydrated,
    isAuthenticated: Boolean(token) && hasValidToken(),
    hasValidToken,
    handleProtectedAction,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: () => {
      void teardownSession();
      toast.success("Sessão encerrada.");
    },
  };
}

export function useAuthError() {
  const handleError = useAuthStore((state) => state.handleError);

  const showAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof AppError && error.isAuthError) {
        handleError(error);
        switch (error.code) {
          case "TOKEN_EXPIRED":
            toast.error("⏰ Sua sessão expirou. Faça login novamente.");
            break;
          case "TOKEN_INVALID":
            toast.error("🔑 Formato do token inválido. Reautentique-se.");
            break;
          case "PERMISSION_DENIED":
            toast.error("🚫 Acesso negado. Permissão insuficiente.");
            break;
          case "SESSION_NOT_FOUND":
            toast.error("🔓 Sessão não encontrada no servidor.");
            break;
          default:
            toast.error(errorMessage(error));
        }
        return true;
      }
      return false;
    },
    [handleError],
  );

  return { showAuthError };
}
