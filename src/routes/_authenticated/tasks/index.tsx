import { createFileRoute } from "@tanstack/react-router";

import { TasksPage } from "@/features/tasks/pages/tasks-page";

export const Route = createFileRoute("/_authenticated/tasks/")({
  head: () => ({
    meta: [
      { title: "Minhas tarefas — TaskFlow" },
      {
        name: "description",
        content: "Crie, filtre, edite e conclua suas tarefas pessoais no TaskFlow.",
      },
      { property: "og:title", content: "Minhas tarefas — TaskFlow" },
      {
        property: "og:description",
        content: "Crie, filtre, edite e conclua suas tarefas pessoais no TaskFlow.",
      },
    ],
  }),
  component: TasksPage,
});
