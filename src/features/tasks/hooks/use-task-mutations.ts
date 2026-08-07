import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppError } from "@/core/errors/app-error";
import { TaskStatus, type CreateTaskInput, type Task, type UpdateTaskInput } from "@/core/types/task";
import { taskService } from "../services/task.service";
import { taskKeys } from "./use-tasks";

function message(error: unknown, fallback: string): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

type ListSnapshot = Array<[readonly unknown[], Task[] | undefined]>;

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: taskKeys.all });

  /** Aplica uma transformação otimista em todas as listas de tarefas em cache. */
  async function patchLists(updater: (tasks: Task[]) => Task[]): Promise<ListSnapshot> {
    await queryClient.cancelQueries({ queryKey: taskKeys.all });
    const snapshot = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });
    for (const [key, data] of snapshot) {
      if (Array.isArray(data)) queryClient.setQueryData(key, updater(data));
    }
    return snapshot as ListSnapshot;
  }

  function rollback(snapshot: ListSnapshot | undefined) {
    if (!snapshot) return;
    for (const [key, data] of snapshot) queryClient.setQueryData(key, data);
  }

  const createTask = useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.create(input),
    onSuccess: () => {
      void invalidate();
      toast.success("Tarefa criada com sucesso.");
    },
    onError: (error) => toast.error(message(error, "Não foi possível criar a tarefa.")),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.update(id, input),
    onMutate: async ({ id, input }) => {
      const previous = await patchLists((tasks) =>
        tasks.map((task) => (task.id === id ? { ...task, ...input } : task)),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      rollback(context?.previous);
      toast.error(message(error, "Não foi possível atualizar a tarefa."));
    },
    onSuccess: () => toast.success("Tarefa atualizada."),
    onSettled: () => void invalidate(),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onMutate: async (id) => {
      const previous = await patchLists((tasks) => tasks.filter((task) => task.id !== id));
      return { previous };
    },
    onError: (error, _id, context) => {
      rollback(context?.previous);
      toast.error(message(error, "Não foi possível excluir a tarefa."));
    },
    onSettled: () => void invalidate(),
  });

  const completeTask = useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onMutate: async (id) => {
      const previous = await patchLists((tasks) =>
        tasks.map((task) => (task.id === id ? { ...task, status: TaskStatus.COMPLETED } : task)),
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      rollback(context?.previous);
      toast.error(message(error, "Não foi possível concluir a tarefa."));
    },
    onSuccess: () => toast.success("Tarefa concluída."),
    onSettled: () => void invalidate(),
  });

  return { createTask, updateTask, deleteTask, completeTask };
}
