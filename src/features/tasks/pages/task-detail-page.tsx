import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { ErrorState } from "@/shared/components/ui/error-state";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { TaskStatus, type Task } from "@/core/types/task";
import { formatDate } from "@/core/utils/date";
import { TaskDialog } from "../components/task-dialog";
import { useTaskQuery } from "../hooks/use-tasks";
import { useTaskMutations } from "../hooks/use-task-mutations";
import type { TaskFormValues } from "../schemas/task.schema";

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const { data: task, isLoading, isError, refetch } = useTaskQuery(taskId);
  const { updateTask, deleteTask, completeTask } = useTaskMutations();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = (values: TaskFormValues) => {
    updateTask.mutate(
      {
        id: taskId,
        input: {
          title: values.title,
          description: values.description,
          dueDate: values.dueDate,
          ...(values.status ? { status: values.status as Task["status"] } : {}),
        },
      },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  return (
    <AppLayout title="Detalhes da tarefa" description="Visualize e gerencie esta tarefa.">
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/tasks">
            <ArrowLeft className="mr-1.5 size-4" />
            Voltar para tarefas
          </Link>
        </Button>

        {isLoading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : isError || !task ? (
          <ErrorState
            title="Tarefa não encontrada"
            message="Não foi possível carregar esta tarefa."
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <article className="surface-card space-y-5 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">{task.title}</h2>
                <StatusBadge status={task.status} />
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {task.description || "Sem descrição."}
              </p>

              <div className="grid gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:grid-cols-3">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-4" />
                  Limite: {formatDate(task.dueDate)}
                </span>
                <span>Criada em {formatDate(task.createdAt)}</span>
                <span>Atualizada em {formatDate(task.updatedAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                <Button onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-1.5 size-4" />
                  Editar
                </Button>
                {task.status !== TaskStatus.COMPLETED ? (
                  <Button
                    variant="outline"
                    disabled={completeTask.isPending}
                    onClick={() => completeTask.mutate(task.id)}
                  >
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Concluir
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="mr-1.5 size-4" />
                  Excluir
                </Button>
              </div>
            </article>

            <TaskDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              task={task}
              submitting={updateTask.isPending}
              onSubmit={handleSubmit}
            />

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Excluir tarefa"
              description="Esta ação não pode ser desfeita."
              confirmLabel="Excluir"
              loading={deleteTask.isPending}
              onConfirm={() => deleteTask.mutate(task.id)}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
