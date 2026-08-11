import { TASK_PRIORITY_LABEL, type TaskPriority } from "@/core/types/task";
import { cn } from "@/lib/utils";

const styles: Record<TaskPriority, string> = {
  LOW: "badge-emerald",
  MEDIUM: "badge-blue",
  HIGH: "badge-amber",
  URGENT: "badge-rose",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[priority],
        className,
      )}
    >
      {TASK_PRIORITY_LABEL[priority]}
    </span>
  );
}
