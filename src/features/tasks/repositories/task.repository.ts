import { httpClient } from "@/core/api/http/http-client";
import { API_ENDPOINTS } from "@/core/api/config/api.config";
import type {
  CreateSubtaskInput,
  CreateTaskInput,
  TaskDTO,
  UpdateTaskInput,
} from "@/core/types/task";

type ListResponse = TaskDTO[] | { data?: TaskDTO[]; items?: TaskDTO[]; content?: TaskDTO[] };

function unwrapList(payload: ListResponse): TaskDTO[] {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.items ?? payload.content ?? [];
}

function unwrapOne(payload: TaskDTO | { data?: TaskDTO }): TaskDTO {
  if (payload && typeof payload === "object" && "data" in payload && payload.data) {
    return payload.data;
  }
  return payload as TaskDTO;
}

export interface ITaskRepository {
  list(): Promise<TaskDTO[]>;
  listByStatus(status: string): Promise<TaskDTO[]>;
  listByPriority(priority: string): Promise<TaskDTO[]>;
  getById(id: string): Promise<TaskDTO>;
  create(input: CreateTaskInput): Promise<TaskDTO>;
  update(id: string, input: UpdateTaskInput): Promise<TaskDTO>;
  remove(id: string): Promise<void>;
  complete(id: string): Promise<TaskDTO>;
  addSubtask(taskId: string, input: CreateSubtaskInput): Promise<TaskDTO>;
  toggleSubtask(taskId: string, subtaskId: string): Promise<TaskDTO>;
  removeSubtask(taskId: string, subtaskId: string): Promise<TaskDTO | null>;
}

// O backend (Java/Spring) espera LocalDateTime em `dueDate`.
// Enviar "YYYY-MM-DD" quebra a desserialização e a API responde 401.
function toApiDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 19);
}

function toPayload<T extends { dueDate?: string | null }>(input: T) {
  return { ...input, dueDate: toApiDateTime(input.dueDate) };
}

export const taskRepository: ITaskRepository = {
  async list() {
    const { data } = await httpClient.get<ListResponse>(API_ENDPOINTS.tasks.root);
    return unwrapList(data);
  },
  async listByStatus(status) {
    const { data } = await httpClient.get<ListResponse>(API_ENDPOINTS.tasks.byStatus(status));
    return unwrapList(data);
  },
  async listByPriority(priority) {
    const { data } = await httpClient.get<ListResponse>(API_ENDPOINTS.tasks.byPriority(priority));
    return unwrapList(data);
  },
  async getById(id) {
    const { data } = await httpClient.get<TaskDTO>(API_ENDPOINTS.tasks.byId(id));
    return unwrapOne(data);
  },
  async create(input) {
    const { data } = await httpClient.post<TaskDTO>(API_ENDPOINTS.tasks.root, toPayload(input));
    return unwrapOne(data);
  },
  async update(id, input) {
    const { data } = await httpClient.put<TaskDTO>(
      API_ENDPOINTS.tasks.byId(id),
      toPayload(input),
    );
    return unwrapOne(data);
  },
  async remove(id) {
    await httpClient.delete(API_ENDPOINTS.tasks.byId(id));
  },
  async complete(id) {
    const { data } = await httpClient.patch<TaskDTO>(API_ENDPOINTS.tasks.complete(id));
    return unwrapOne(data);
  },
  async addSubtask(taskId, input) {
    const { data } = await httpClient.post<TaskDTO>(API_ENDPOINTS.tasks.subtasks(taskId), {
      title: input.title.trim(),
    });
    return unwrapOne(data);
  },
  async toggleSubtask(taskId, subtaskId) {
    const { data } = await httpClient.patch<TaskDTO>(
      API_ENDPOINTS.tasks.toggleSubtask(taskId, subtaskId),
    );
    return unwrapOne(data);
  },
  async removeSubtask(taskId, subtaskId) {
    // A API pode responder 204 (sem corpo) ou devolver a tarefa atualizada.
    const { data } = await httpClient.delete<TaskDTO | "">(
      API_ENDPOINTS.tasks.subtaskById(taskId, subtaskId),
    );
    if (!data || typeof data === "string") return null;
    return unwrapOne(data);
  },
};
