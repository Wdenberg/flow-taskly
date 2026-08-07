import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Loader } from "@/shared/components/ui/loader";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TaskFlow — Gerenciamento de tarefas pessoais" },
      {
        name: "description",
        content:
          "TaskFlow é um gerenciador de tarefas pessoais simples e rápido: crie, filtre e conclua suas tarefas.",
      },
      { property: "og:title", content: "TaskFlow — Gerenciamento de tarefas pessoais" },
      {
        property: "og:description",
        content:
          "TaskFlow é um gerenciador de tarefas pessoais simples e rápido: crie, filtre e conclua suas tarefas.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const hasValidToken = useAuthStore((state) => state.hasValidToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    void navigate({ to: hasValidToken() ? "/dashboard" : "/login", replace: true });
  }, [hydrated, hasValidToken, navigate]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <Loader label="Carregando TaskFlow..." />
    </main>
  );
}
