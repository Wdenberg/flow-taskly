import { z } from "zod";

import { TASK_STATUSES } from "@/core/types/task";

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter ao menos 3 caracteres")
    .max(120, "O título deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  dueDate: z
    .string()
    .min(1, "Informe a data limite")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Data inválida"),
  status: z.enum(TASK_STATUSES as [string, ...string[]]).optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
