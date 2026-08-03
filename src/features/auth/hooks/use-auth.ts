import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppError } from "@/core/errors/app-error";
import type { LoginCredentials, RegisterCredentials } from "@/core/types/auth";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

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

  return {
    user,
    token,
    hydrated,
    isAuthenticated: Boolean(token),
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
