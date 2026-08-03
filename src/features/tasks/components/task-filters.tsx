import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from "@/shared/components/ui/search-bar";
import { TASK_STATUSES, TASK_STATUS_LABEL, type TaskStatus } from "@/core/types/task";
import { useTaskFiltersStore } from "../store/task-filters.store";
import type { TaskSortBy } from "@/core/types/task";

const sortLabels: Record<TaskSortBy, string> = {
  dueDate: "Data limite",
  createdAt: "Mais recentes",
  status: "Status",
  title: "Título (A-Z)",
};

export function TaskFilters() {
  const { status, search, sortBy, setStatus, setSearch, setSortBy } = useTaskFiltersStore();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="md:max-w-sm md:flex-1">
        <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar tarefas..." />
      </div>

      <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus | "ALL")}>
        <SelectTrigger className="h-10 w-full rounded-xl bg-card md:w-48" aria-label="Filtrar por status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {TASK_STATUSES.map((option) => (
            <SelectItem key={option} value={option}>
              {TASK_STATUS_LABEL[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(value) => setSortBy(value as TaskSortBy)}>
        <SelectTrigger className="h-10 w-full rounded-xl bg-card md:w-48" aria-label="Ordenar por">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(sortLabels) as TaskSortBy[]).map((option) => (
            <SelectItem key={option} value={option}>
              {sortLabels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
