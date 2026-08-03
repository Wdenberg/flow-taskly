export const TaskStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TASK_STATUSES: TaskStatus[] = [
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
  TaskStatus.CANCELLED,
];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TaskDTO {
  id?: string | number;
  _id?: string;
  title?: string;
  description?: string | null;
  status?: string;
  dueDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
}

export interface UpdateTaskInput extends CreateTaskInput {
  status?: TaskStatus;
}

export type TaskSortBy = "dueDate" | "createdAt" | "status" | "title";

export interface TaskFilters {
  status: TaskStatus | "ALL";
  search: string;
  sortBy: TaskSortBy;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}
