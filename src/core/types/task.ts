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

export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TASK_PRIORITIES: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface SubtaskDTO {
  id?: string | number;
  _id?: string;
  title?: string;
  completed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  subtasks: Subtask[];
}

export interface TaskDTO {
  id?: string | number;
  _id?: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  subtasks?: SubtaskDTO[] | null;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
}

export interface UpdateTaskInput extends CreateTaskInput {
  status?: TaskStatus;
}

export interface CreateSubtaskInput {
  title: string;
}

export type TaskSortBy = "dueDate" | "createdAt" | "status" | "title";

export interface TaskFilters {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
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
