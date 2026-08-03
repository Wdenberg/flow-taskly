import { Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { TaskStatus, type Task } from "@/core/types/task";
import { formatDate, isOverdue } from "@/core/utils/date";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  busy?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onComplete, busy = false }: TaskCardProps) {
  const done = task.status === TaskStatus.COMPLETED;
  const late = !done && isOverdue(task.dueDate);

  return (
    <article className="surface-card flex flex-col gap-4 p-5 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={cn(
              "truncate text-base font-semibold text-foreground",
              done && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {task.description || "Sem descrição"}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className={cn("inline-flex items-center gap-1.5", late && "text-destructive")}>
          <CalendarClock className="size-3.5" />
          Limite: {formatDate(task.dueDate)}
        </span>
        <span>Criada em {formatDate(task.createdAt)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/tasks/$taskId" params={{ taskId: task.id }}>
            <Eye className="mr-1.5 size-4" />
            Detalhes
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
          <Pencil className="mr-1.5 size-4" />
          Editar
        </Button>
        {!done ? (
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => onComplete(task)}>
            <CheckCircle2 className="mr-1.5 size-4" />
            Concluir
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="mr-1.5 size-4" />
          Excluir
        </Button>
      </div>
    </article>
  );
}
