import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
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
  const navigate = useNavigate();

  const logoutRef = useRef(clearSession);
  useEffect(() => {
    logoutRef.current = clearSession;
  }, [clearSession]);

  // Listener para logout em outras abas.
  useEffect(() => {
    const handleLogout = () => {
      logoutRef.current();
      void navigate({ to: "/login" });
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (session) => {
      setSession(session);
      toast.success(`Bem-vindo(a), ${session.user.name}!`);
      void navigate({ to: "/dashboard" });
    },
    onError: (error) => toast.error(errorMessage(error)),
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
    onError: (error) => toast.error(errorMessage(error)),
  });

  // Executa uma ação protegida, verificando o token antes e tratando erros de auth.
  const handleProtectedAction = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      if (!hasValidToken()) {
        const error = new AppError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED, 401);
        error.code = "AUTH_SESSION_EXPIRED";
        error.isAuthError = true;
        throw error;
      }

      try {
        return await action();
      } catch (error) {
        if (error instanceof AppError && error.isAuthError) {
          logoutRef.current();
          void navigate({ to: "/login" });
        }
        throw error;
      }
    },
    [hasValidToken, navigate],
  );

  return {
    user,
    token,
    hydrated,
    isAuthenticated: Boolean(token),
    hasValidToken,
    handleProtectedAction,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: () => {
      clearSession();
      toast.success("Sessão encerrada.");
      void navigate({ to: "/login" });
    },
  };
}
