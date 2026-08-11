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

  /** A API devolve a tarefa atualizada: gravamos a resposta no cache (listas + detalhe). */
  function writeTask(task: Task) {
    queryClient.setQueryData(taskKeys.detail(task.id), task);
    const entries = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });
    for (const [key, data] of entries) {
      if (Array.isArray(data)) {
        queryClient.setQueryData(
          key,
          data.map((item) => (item.id === task.id ? task : item)),
        );
      }
    }
  }

  /** Atualização otimista de uma única tarefa (listas + detalhe), com snapshot. */
  async function patchTask(id: string, updater: (task: Task) => Task) {
    await queryClient.cancelQueries({ queryKey: taskKeys.all });
    const detailKey = taskKeys.detail(id);
    const previousDetail = queryClient.getQueryData<Task>(detailKey);
    if (previousDetail) queryClient.setQueryData(detailKey, updater(previousDetail));
    const previous = await patchLists((tasks) =>
      tasks.map((task) => (task.id === id ? updater(task) : task)),
    );
    return { previous, previousDetail, detailKey };
  }

  function rollbackTask(context?: {
    previous: ListSnapshot;
    previousDetail: Task | undefined;
    detailKey: readonly unknown[];
  }) {
    if (!context) return;
    rollback(context.previous);
    if (context.previousDetail) queryClient.setQueryData(context.detailKey, context.previousDetail);
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
    onSuccess: (task) => {
      writeTask(task);
      toast.success("Tarefa atualizada.");
    },
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
    onMutate: async (id) =>
      patchTask(id, (task) => ({ ...task, status: TaskStatus.COMPLETED })),
    onError: (error, _id, context) => {
      rollbackTask(context);
      toast.error(message(error, "Não foi possível concluir a tarefa."));
    },
    onSuccess: (task) => {
      writeTask(task);
      toast.success("Tarefa concluída.");
    },
    onSettled: () => void invalidate(),
  });

  const addSubtask = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      taskService.addSubtask(taskId, { title }),
    onSuccess: (task) => {
      writeTask(task);
      toast.success("Subtarefa adicionada.");
    },
    onError: (error) => toast.error(message(error, "Não foi possível adicionar a subtarefa.")),
    onSettled: () => void invalidate(),
  });

  const toggleSubtask = useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      taskService.toggleSubtask(taskId, subtaskId),
    onMutate: async ({ taskId, subtaskId }) =>
      patchTask(taskId, (task) => ({
        ...task,
        subtasks: task.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub,
        ),
      })),
    onError: (error, _vars, context) => {
      rollbackTask(context);
      toast.error(message(error, "Não foi possível atualizar a subtarefa."));
    },
    onSuccess: (task) => writeTask(task),
    onSettled: () => void invalidate(),
  });

  const removeSubtask = useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      taskService.removeSubtask(taskId, subtaskId),
    onMutate: async ({ taskId, subtaskId }) =>
      patchTask(taskId, (task) => ({
        ...task,
        subtasks: task.subtasks.filter((sub) => sub.id !== subtaskId),
      })),
    onError: (error, _vars, context) => {
      rollbackTask(context);
      toast.error(message(error, "Não foi possível remover a subtarefa."));
    },
    onSuccess: (task) => {
      writeTask(task);
      toast.success("Subtarefa removida.");
    },
    onSettled: () => void invalidate(),
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
  };
}
