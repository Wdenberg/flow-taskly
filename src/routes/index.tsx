import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Loader } from "@/shared/components/ui/loader";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/")({
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
  const { hydrated, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    void navigate({ to: isAuthenticated ? "/dashboard" : "/login", replace: true });
  }, [hydrated, isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader label="Carregando TaskFlow..." />
    </div>
  );
}
