import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { PaginationBar } from "@/shared/components/ui/pagination-bar";
import { ColdStartNotice } from "@/shared/components/ui/cold-start-notice";
import type { Task } from "@/core/types/task";
import { TaskCard } from "../components/task-card";
import { TaskDialog } from "../components/task-dialog";
import { TaskFilters } from "../components/task-filters";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useTaskFiltersStore } from "../store/task-filters.store";
import type { TaskFormValues } from "../schemas/task.schema";

export function TasksPage() {
  const { pageItems, isLoading, isFetching, isError, refetch, page, totalPages, totalItems, pageSize } =
    useTasks();
  const setPage = useTaskFiltersStore((s) => s.setPage);
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

  // Exclusão com "Desfazer": a API não tem lixeira, então recriamos a tarefa.
  const confirmDelete = () => {
    const target = pendingDelete;
    if (!target) return;
    deleteTask.mutate(target.id, {
      onSuccess: () => {
        setPendingDelete(undefined);
        toast.success(`"${target.title}" excluída.`, {
          action: {
            label: "Desfazer",
            onClick: () =>
              createTask.mutate({
                title: target.title,
                description: target.description,
                dueDate: target.dueDate ?? "",
              }),
          },
        });
      },
    });
  };

  return (
    <AppLayout
      title="Tarefas"
      description="Crie, filtre e acompanhe todas as suas tarefas."
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Nova tarefa
        </Button>
      }
    >
      <div className="space-y-6">
        <TaskFilters />

        <ColdStartNotice active={isLoading || isFetching} />

        {isLoading ? (
          <div className="card-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : totalItems === 0 ? (
          <EmptyState
            title="Nenhuma tarefa encontrada"
            description="Ajuste os filtros ou crie sua primeira tarefa para começar."
            actionLabel="Criar tarefa"
            onAction={openCreate}
          />
        ) : (
          <>
            <ul className="card-grid list-none p-0">
              {pageItems.map((task) => (
                <li key={task.id} className="min-w-0">
                  <TaskCard
                    task={task}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                    onComplete={(item) => completeTask.mutate(item.id)}
                    busy={completeTask.isPending}
                  />
                </li>
              ))}
            </ul>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
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
        description={`Tem certeza que deseja excluir "${pendingDelete?.title ?? ""}"? Você poderá desfazer logo após a exclusão.`}
        confirmLabel="Excluir"
        loading={deleteTask.isPending}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
