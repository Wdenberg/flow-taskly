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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setSession: (session) => set({ user: session.user, token: session.token }),
      logout: () => set({ user: null, token: null }),
      setHydrated: () => set({ hydrated: true }),
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
