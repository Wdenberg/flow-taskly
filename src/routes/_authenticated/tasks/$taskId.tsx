import { createFileRoute } from "@tanstack/react-router";

import { TaskDetailPage } from "@/features/tasks/pages/task-detail-page";

export const Route = createFileRoute("/tasks/$taskId")({
  head: () => ({
    meta: [
      { title: "Detalhes da tarefa — TaskFlow" },
      {
        name: "description",
        content: "Veja os detalhes, prazo e status de uma tarefa específica no TaskFlow.",
      },
      { property: "og:title", content: "Detalhes da tarefa — TaskFlow" },
      {
        property: "og:description",
        content: "Veja os detalhes, prazo e status de uma tarefa específica no TaskFlow.",
      },
    ],
  }),
  component: TaskDetailRoute,
});

function TaskDetailRoute() {
  const { taskId } = Route.useParams();
  return <TaskDetailPage taskId={taskId} />;
}
