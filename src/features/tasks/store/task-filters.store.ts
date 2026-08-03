import { create } from "zustand";

import type { TaskFilters, TaskSortBy, TaskStatus } from "@/core/types/task";

interface TaskFiltersState extends TaskFilters {
  setStatus: (status: TaskStatus | "ALL") => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: TaskSortBy) => void;
  reset: () => void;
}

const initial: TaskFilters = { status: "ALL", search: "", sortBy: "dueDate" };

export const useTaskFiltersStore = create<TaskFiltersState>()((set) => ({
  ...initial,
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set(initial),
}));
