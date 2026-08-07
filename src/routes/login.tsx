import { createFileRoute, redirect } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/pages/login-page";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},

  // Já autenticado não vê a tela de login.
  beforeLoad: () => {
    if (useAuthStore.getState().hasValidToken()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Entrar — TaskFlow" },
      {
        name: "description",
        content: "Acesse sua conta TaskFlow e gerencie suas tarefas pessoais com foco.",
      },
      { property: "og:title", content: "Entrar — TaskFlow" },
      {
        property: "og:description",
        content: "Acesse sua conta TaskFlow e gerencie suas tarefas pessoais com foco.",
      },
    ],
  }),
  component: LoginPage,
});
