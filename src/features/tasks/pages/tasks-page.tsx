import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import type { Task } from "@/core/types/task";
import { TaskCard } from "../components/task-card";
import { TaskDialog } from "../components/task-dialog";
import { TaskFilters } from "../components/task-filters";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutations } from "../hooks/use-task-mutations";
import type { TaskFormValues } from "../schemas/task.schema";

export function TasksPage() {
  const { tasks, isLoading, isError, refetch } = useTasks();
  const { createTask, updateTask, deleteTask, completeTask } = useTaskMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Task | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  const handleSubmit = (values: TaskFormValues) => {
    if (editing) {
      updateTask.mutate(
        {
          id: editing.id,
          input: {
            title: values.title,
            description: values.description,
            dueDate: values.dueDate,
            ...(values.status ? { status: values.status as Task["status"] } : {}),
          },
        },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }

    createTask.mutate(
      { title: values.title, description: values.description, dueDate: values.dueDate },
      { onSuccess: () => setDialogOpen(false) },
    );
  };

  return (
    <AppLayout
      title="Tarefas"
      description="Crie, filtre e acompanhe todas as suas tarefas."
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Nova tarefa
        </Button>
      }
    >
      <div className="space-y-6">
        <TaskFilters />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="Nenhuma tarefa encontrada"
            description="Ajuste os filtros ou crie sua primeira tarefa para começar."
            actionLabel="Criar tarefa"
            onAction={openCreate}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onComplete={(item) => completeTask.mutate(item.id)}
                busy={completeTask.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        submitting={createTask.isPending || updateTask.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title="Excluir tarefa"
        description={`Tem certeza que deseja excluir "${pendingDelete?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteTask.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteTask.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(undefined) });
        }}
      />
    </AppLayout>
  );
}
