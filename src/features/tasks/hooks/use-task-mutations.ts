import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppError } from "@/core/errors/app-error";
import type { CreateTaskInput, UpdateTaskInput } from "@/core/types/task";
import { taskService } from "../services/task.service";
import { taskKeys } from "./use-tasks";

function message(error: unknown, fallback: string): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: taskKeys.all });

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
    onSuccess: () => {
      void invalidate();
      toast.success("Tarefa atualizada.");
    },
    onError: (error) => toast.error(message(error, "Não foi possível atualizar a tarefa.")),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => {
      void invalidate();
      toast.success("Tarefa excluída.");
    },
    onError: (error) => toast.error(message(error, "Não foi possível excluir a tarefa.")),
  });

  const completeTask = useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onSuccess: () => {
      void invalidate();
      toast.success("Tarefa concluída.");
    },
    onError: (error) => toast.error(message(error, "Não foi possível concluir a tarefa.")),
  });

  return { createTask, updateTask, deleteTask, completeTask };
}
