export const API_BASE_URL = "https://task-api-9vu0.onrender.com/api/v1";

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
  },
} as const;

export const AUTH_STORAGE_KEY = "taskflow.auth";
