import { TASK_STATUS_LABEL, type TaskStatus } from "@/core/types/task";
import { cn } from "@/lib/utils";

const styles: Record<TaskStatus, string> = {
  PENDING: "badge-amber",
  IN_PROGRESS: "badge-blue",
  COMPLETED: "badge-emerald",
  CANCELLED: "badge-rose",
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
