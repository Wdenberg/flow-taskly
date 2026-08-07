import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/core/api/config/api.config";
import { configureHttpAuth } from "@/core/api/http/http-client";
import { AppError } from "@/core/errors/app-error";
import { isTokenExpired, millisUntilExpiry, sanitizeToken } from "@/core/utils/token";
import type { AuthSession, User } from "@/core/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
  setHydrated: () => void;
  hasValidToken: () => boolean;
  handleError: (error: unknown) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      setSession: (session) => {
        const token = sanitizeToken(session.token);
        set({ user: session.user, token });
        scheduleExpiryLogout(token);
      },
      logout: () => {
        clearExpiryTimer();
        set({ user: null, token: null });
        // Notifica outras abas/ouvintes que a sessão foi encerrada.
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }
      },
      setHydrated: () => set({ hydrated: true }),
      // Válido = existe, é um JWT bem formado e ainda não expirou.
      hasValidToken: () => {
        const token = sanitizeToken(get().token);
        if (!token) return false;
        return !isTokenExpired(token);
      },
      handleError: (error) => {
        if (error instanceof AppError && error.isAuthError) {
          if (import.meta.env.DEV) {
            console.debug(`[auth] Erro de autenticação (${new Date().toISOString()}):`, error.getDiagnosticInfo());
          }
          get().logout();
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        const token = sanitizeToken(state?.token);
        if (import.meta.env.DEV) {
          console.debug(
            `[auth] token restaurado de "${AUTH_STORAGE_KEY}": ${
              token ? `${token.slice(0, 12)}…(${token.length})` : "nenhum"
            }`,
          );
        }
        // Descarta imediatamente uma sessão já expirada no storage.
        if (token && isTokenExpired(token)) {
          state?.logout();
        } else {
          scheduleExpiryLogout(token);
        }
        state?.setHydrated();
      },
    },
  ),
);

// --- Expiração proativa: desloga automaticamente quando o JWT vence ---

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

function clearExpiryTimer() {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

function scheduleExpiryLogout(token: string | null) {
  clearExpiryTimer();
  if (!token || typeof window === "undefined") return;
  const remaining = millisUntilExpiry(token);
  if (remaining === null) return; // token sem `exp`: quem decide é o backend
  const delay = Math.max(remaining - 30_000, 0);
  expiryTimer = setTimeout(() => useAuthStore.getState().logout(), delay);
}

configureHttpAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    if (useAuthStore.getState().token) useAuthStore.getState().logout();
  },
});
