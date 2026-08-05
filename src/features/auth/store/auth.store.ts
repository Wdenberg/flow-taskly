import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/core/api/config/api.config";
import { configureHttpAuth } from "@/core/api/http/http-client";
import type { AuthSession, User } from "@/core/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
  setHydrated: () => void;
  hasValidToken: () => boolean;
}

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      setSession: (session) => {
        const token = sanitizeToken(session.token);
        set({ user: session.user, token });
      },
      logout: () => {
        set({ user: null, token: null });
        // Notifica outras abas que a sessão foi encerrada.
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }
      },
      setHydrated: () => set({ hydrated: true }),
      hasValidToken: () => {
        const token = sanitizeToken(get().token);
        return token !== null;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (import.meta.env.DEV) {
          const t = state?.token;
          console.debug(
            `[auth] token restaurado de "${AUTH_STORAGE_KEY}": ${
              typeof t === "string" && t ? `${t.slice(0, 12)}…(${t.length})` : "nenhum"
            }`,
          );
        }
        state?.setHydrated();
      },
    },
  ),
);

configureHttpAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
});

// Listener global: logout em uma aba limpa a sessão em todas as outras.
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    useAuthStore.getState().logout();
  });
}
