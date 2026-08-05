import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/core/types/task";
import { TaskForm } from "./task-form";
import type { TaskFormValues } from "../schemas/task.schema";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | undefined;
  submitting?: boolean;
  onSubmit: (values: TaskFormValues) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  submitting = false,
  onSubmit,
}: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-scroll max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Atualize as informações da sua tarefa."
              : "Descreva o que precisa ser feito e defina um prazo."}
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          key={task?.id ?? "new"}
          task={task}
          submitting={submitting}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
