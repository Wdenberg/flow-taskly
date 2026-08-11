import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/shared/components/ui/loader";
import type { Task } from "@/core/types/task";
import { cn } from "@/lib/utils";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { subtaskSchema } from "../schemas/task.schema";

export function SubtaskList({ task }: { task: Task }) {
  const { addSubtask, toggleSubtask, removeSubtask } = useTaskMutations();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const done = task.subtasks.filter((sub) => sub.completed).length;
  const total = task.subtasks.length;

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    const parsed = subtaskSchema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Título inválido");
      return;
    }
    setError(null);
    addSubtask.mutate(
      { taskId: task.id, title: parsed.data.title },
      { onSuccess: () => setTitle("") },
    );
  };

  return (
    <section className="surface-card min-w-0 space-y-4 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight">Subtarefas</h3>
        <span className="text-xs text-muted-foreground">
          {total > 0 ? `${done} de ${total} concluídas` : "Nenhuma subtarefa"}
        </span>
      </div>

      {total > 0 ? (
        <ul className="list-none space-y-2 p-0">
          {task.subtasks.map((subtask) => (
            <li
              key={subtask.id}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <Checkbox
                id={`subtask-${subtask.id}`}
                checked={subtask.completed}
                onCheckedChange={() =>
                  toggleSubtask.mutate({ taskId: task.id, subtaskId: subtask.id })
                }
                aria-label={`Alternar subtarefa ${subtask.title}`}
              />
              <label
                htmlFor={`subtask-${subtask.id}`}
                className={cn(
                  "min-w-0 flex-1 cursor-pointer text-sm break-words",
                  subtask.completed && "text-muted-foreground line-through",
                )}
              >
                {subtask.title}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Excluir subtarefa ${subtask.title}`}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeSubtask.mutate({ taskId: task.id, subtaskId: subtask.id })}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleAdd} noValidate>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nova subtarefa"
          aria-label="Título da nova subtarefa"
        />
        <Button type="submit" disabled={addSubtask.isPending}>
          {addSubtask.isPending ? (
            <Spinner className="mr-1.5" />
          ) : (
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
          )}
          Adicionar
        </Button>
      </form>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </section>
  );
}
