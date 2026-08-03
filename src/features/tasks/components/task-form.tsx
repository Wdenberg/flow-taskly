import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/shared/components/ui/loader";
import { TASK_STATUSES, TASK_STATUS_LABEL, type Task } from "@/core/types/task";
import { toDateInputValue } from "@/core/utils/date";
import { taskSchema, type TaskFormValues } from "../schemas/task.schema";

interface TaskFormProps {
  task?: Task | undefined;
  submitting?: boolean;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

export function TaskForm({ task, submitting = false, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      dueDate: toDateInputValue(task?.dueDate) || toDateInputValue(new Date().toISOString()),
      status: task?.status ?? "PENDING",
    },
  });

  const status = watch("status");

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder="Ex.: Revisar proposta" {...register("title")} />
        {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Detalhes da tarefa (opcional)"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data limite</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          {errors.dueDate ? (
            <p className="text-xs text-destructive">{errors.dueDate.message}</p>
          ) : null}
        </div>

        {task ? (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status ?? "PENDING"} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {TASK_STATUS_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {task ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  );
}
