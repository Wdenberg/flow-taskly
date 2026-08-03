import { TASK_STATUS_LABEL, type TaskStatus } from "@/core/types/task";
import { cn } from "@/lib/utils";

const styles: Record<TaskStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 ring-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status],
        className,
      )}
    >
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}
