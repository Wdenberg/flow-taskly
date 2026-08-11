import {
  TaskPriority,
  TaskStatus,
  type CreateSubtaskInput,
  type CreateTaskInput,
  type Subtask,
  type SubtaskDTO,
  type Task,
  type TaskDTO,
  type TaskFilters,
  type TaskStats,
  type UpdateTaskInput,
} from "@/core/types/task";
import { taskRepository, type ITaskRepository } from "../repositories/task.repository";

function toStatus(value: string | undefined): TaskStatus {
  const upper = (value ?? "").toUpperCase();
  if (upper in TaskStatus) return upper as TaskStatus;
  return TaskStatus.PENDING;
}

function toPriority(value: string | undefined): TaskPriority {
  const upper = (value ?? "").toUpperCase();
  if (upper in TaskPriority) return upper as TaskPriority;
  return TaskPriority.MEDIUM;
}

export function mapSubtask(dto: SubtaskDTO): Subtask {
  return {
    id: String(dto.id ?? dto._id ?? ""),
    title: dto.title ?? "Sem título",
    completed: Boolean(dto.completed),
  };
}

export function mapTask(dto: TaskDTO): Task {
  return {
    id: String(dto.id ?? dto._id ?? ""),
    title: dto.title ?? "Sem título",
    description: dto.description ?? "",
    status: toStatus(dto.status),
    priority: toPriority(dto.priority),
    dueDate: dto.dueDate ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
    subtasks: (dto.subtasks ?? []).map(mapSubtask),
  };
}

const statusOrder: Record<TaskStatus, number> = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  CANCELLED: 3,
};

function time(value: string | null): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

/**
 * Status e prioridade já são resolvidos pelos endpoints da API
 * (`/tasks/status/{s}` e `/tasks/priority/{p}`); aqui sobra a busca textual
 * e a ordenação, que a API não oferece.
 */
export function applyFilters(tasks: Task[], filters: Pick<TaskFilters, "search" | "sortBy">): Task[] {
  const search = filters.search.trim().toLowerCase();
  const filtered = search
    ? tasks.filter((task) => task.title.toLowerCase().includes(search))
    : [...tasks];

  return filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "title":
        return a.title.localeCompare(b.title, "pt-BR");
      case "status":
        return statusOrder[a.status] - statusOrder[b.status];
      case "createdAt":
        return time(b.createdAt) - time(a.createdAt);
      case "dueDate":
      default:
        return time(a.dueDate) - time(b.dueDate);
    }
  });
}

export function buildStats(tasks: Task[]): TaskStats {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    cancelled: tasks.filter((t) => t.status === TaskStatus.CANCELLED).length,
  };
}

export interface Paginated<T> {
  pageItems: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Paginação em memória: a API devolve a coleção inteira. */
export function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const size = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * size;
  return {
    pageItems: items.slice(start, start + size),
    page: current,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

export interface ListQuery {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
}

export function createTaskService(repository: ITaskRepository = taskRepository) {
  return {
    /**
     * A API não expõe um endpoint combinando status + prioridade: quando os
     * dois filtros estão ativos, busca por status e refina a prioridade aqui.
     */
    async list({ status, priority }: ListQuery): Promise<Task[]> {
      let dtos: TaskDTO[];
      if (status !== "ALL") {
        dtos = await repository.listByStatus(status);
      } else if (priority !== "ALL") {
        dtos = await repository.listByPriority(priority);
      } else {
        dtos = await repository.list();
      }

      const tasks = dtos.map(mapTask);
      if (status !== "ALL" && priority !== "ALL") {
        return tasks.filter((task) => task.priority === priority);
      }
      return tasks;
    },
    async getById(id: string): Promise<Task> {
      return mapTask(await repository.getById(id));
    },
    async create(input: CreateTaskInput): Promise<Task> {
      return mapTask(await repository.create(input));
    },
    async update(id: string, input: UpdateTaskInput): Promise<Task> {
      return mapTask(await repository.update(id, input));
    },
    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },
    async complete(id: string): Promise<Task> {
      return mapTask(await repository.complete(id));
    },
    async addSubtask(taskId: string, input: CreateSubtaskInput): Promise<Task> {
      return mapTask(await repository.addSubtask(taskId, input));
    },
    async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
      return mapTask(await repository.toggleSubtask(taskId, subtaskId));
    },
    async removeSubtask(taskId: string, subtaskId: string): Promise<Task> {
      const dto = await repository.removeSubtask(taskId, subtaskId);
      // 204 sem corpo: relê a tarefa para manter a API como fonte de verdade.
      return dto ? mapTask(dto) : mapTask(await repository.getById(taskId));
    },
  };
}

export const taskService = createTaskService();
