import { create } from "zustand";

import type { TaskFilters, TaskPriority, TaskSortBy, TaskStatus } from "@/core/types/task";

export const TASK_PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;

interface TaskFiltersState extends TaskFilters {
  page: number;
  pageSize: number;
  setStatus: (status: TaskStatus | "ALL") => void;
  setPriority: (priority: TaskPriority | "ALL") => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: TaskSortBy) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

const initial: TaskFilters & { page: number; pageSize: number } = {
  status: "ALL",
  priority: "ALL",
  search: "",
  sortBy: "dueDate",
  page: 1,
  pageSize: 12,
};

export const useTaskFiltersStore = create<TaskFiltersState>()((set) => ({
  ...initial,
  // Qualquer mudança de filtro volta para a primeira página.
  setStatus: (status) => set({ status, page: 1 }),
  setPriority: (priority) => set({ priority, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setPage: (page) => set({ page: Math.max(1, page) }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  reset: () => set(initial),
}));
