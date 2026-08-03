import {
  TaskStatus,
  type CreateTaskInput,
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

export function mapTask(dto: TaskDTO): Task {
  return {
    id: String(dto.id ?? dto._id ?? ""),
    title: dto.title ?? "Sem título",
    description: dto.description ?? "",
    status: toStatus(dto.status),
    dueDate: dto.dueDate ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
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

export function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
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

export function createTaskService(repository: ITaskRepository = taskRepository) {
  return {
    async list(status: TaskStatus | "ALL"): Promise<Task[]> {
      const dtos =
        status === "ALL" ? await repository.list() : await repository.listByStatus(status);
      return dtos.map(mapTask);
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
  };
}

export const taskService = createTaskService();
