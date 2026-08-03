import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Task, TaskStatus } from "@/core/types/task";
import { applyFilters, buildStats, taskService } from "../services/task.service";
import { useTaskFiltersStore } from "../store/task-filters.store";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (status: TaskStatus | "ALL") => ["tasks", "list", status] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};

export function useTasksQuery(status: TaskStatus | "ALL" = "ALL") {
  return useQuery({
    queryKey: taskKeys.list(status),
    queryFn: () => taskService.list(status),
    staleTime: 30_000,
  });
}

export function useTasks() {
  const status = useTaskFiltersStore((s) => s.status);
  const search = useTaskFiltersStore((s) => s.search);
  const sortBy = useTaskFiltersStore((s) => s.sortBy);

  const query = useTasksQuery(status);
  const tasks: Task[] = useMemo(
    () => applyFilters(query.data ?? [], { status, search, sortBy }),
    [query.data, status, search, sortBy],
  );

  return { ...query, tasks };
}

export function useTaskStats() {
  const query = useTasksQuery("ALL");
  const stats = useMemo(() => buildStats(query.data ?? []), [query.data]);
  return { ...query, stats, tasks: query.data ?? [] };
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getById(id),
    enabled: Boolean(id),
  });
}
