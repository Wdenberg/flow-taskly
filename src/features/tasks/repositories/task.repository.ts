import { httpClient } from "@/core/api/http/http-client";
import { API_ENDPOINTS } from "@/core/api/config/api.config";
import type { CreateTaskInput, TaskDTO, UpdateTaskInput } from "@/core/types/task";

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
  getById(id: string): Promise<TaskDTO>;
  create(input: CreateTaskInput): Promise<TaskDTO>;
  update(id: string, input: UpdateTaskInput): Promise<TaskDTO>;
  remove(id: string): Promise<void>;
  complete(id: string): Promise<TaskDTO>;
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
  async getById(id) {
    const { data } = await httpClient.get<TaskDTO>(API_ENDPOINTS.tasks.byId(id));
    return unwrapOne(data);
  },
  async create(input) {
    const { data } = await httpClient.post<TaskDTO>(API_ENDPOINTS.tasks.root, input);
    return unwrapOne(data);
  },
  async update(id, input) {
    const { data } = await httpClient.put<TaskDTO>(API_ENDPOINTS.tasks.byId(id), input);
    return unwrapOne(data);
  },
  async remove(id) {
    await httpClient.delete(API_ENDPOINTS.tasks.byId(id));
  },
  async complete(id) {
    const { data } = await httpClient.patch<TaskDTO>(API_ENDPOINTS.tasks.complete(id));
    return unwrapOne(data);
  },
};
