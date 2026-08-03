import { createFileRoute } from "@tanstack/react-router";

import { RegisterPage } from "@/features/auth/pages/register-page";

export const Route = createFileRoute("/register")({
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
