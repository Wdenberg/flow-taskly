import { createFileRoute, redirect } from "@tanstack/react-router";

import { RegisterPage } from "@/features/auth/pages/register-page";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/register")({
  ssr: false,
  beforeLoad: () => {
    if (useAuthStore.getState().hasValidToken()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Criar conta — TaskFlow" },
      {
        name: "description",
        content: "Crie sua conta gratuita no TaskFlow e organize suas tarefas em minutos.",
      },
      { property: "og:title", content: "Criar conta — TaskFlow" },
      {
        property: "og:description",
        content: "Crie sua conta gratuita no TaskFlow e organize suas tarefas em minutos.",
      },
    ],
  }),
  component: RegisterPage,
});
