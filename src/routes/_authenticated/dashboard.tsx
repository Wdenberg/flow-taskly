import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/features/tasks/pages/dashboard-page";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TaskFlow" },
      {
        name: "description",
        content: "Acompanhe estatísticas e tarefas recentes no painel do TaskFlow.",
      },
      { property: "og:title", content: "Dashboard — TaskFlow" },
      {
        property: "og:description",
        content: "Acompanhe estatísticas e tarefas recentes no painel do TaskFlow.",
      },
    ],
  }),
  component: DashboardPage,
});
