import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/pages/login-page";

export const Route = createFileRoute("/login")({
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
