// A API pública não envia cabeçalhos CORS, então as chamadas passam por um
// proxy no próprio servidor da aplicação (mesma origem, sem preflight bloqueado).
export const API_BASE_URL = "/api/public/task-api";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  tasks: {
    root: "/tasks",
    byId: (id: string) => `/tasks/${id}`,
    complete: (id: string) => `/tasks/${id}/complete`,
    byStatus: (status: string) => `/tasks/status/${status}`,
    byPriority: (priority: string) => `/tasks/priority/${priority}`,
    subtasks: (taskId: string) => `/tasks/${taskId}/subtasks`,
    subtaskById: (taskId: string, subtaskId: string) => `/tasks/${taskId}/subtasks/${subtaskId}`,
    toggleSubtask: (taskId: string, subtaskId: string) =>
      `/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
  },
} as const;

export const AUTH_STORAGE_KEY = "taskflow.auth";
