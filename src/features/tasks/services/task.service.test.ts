import { describe, expect, it } from "vitest";

import { TaskPriority, TaskStatus, type Task } from "@/core/types/task";
import { applyFilters, buildStats, mapTask, paginate } from "@/features/tasks/services/task.service";

function task(partial: Partial<Task> & { id: string }): Task {
  return {
    title: "Tarefa",
    description: "",
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    subtasks: [],
    dueDate: null,
    createdAt: null,
    updatedAt: null,
    ...partial,
  };
}

describe("mapTask", () => {
  it("normaliza um DTO incompleto", () => {
    expect(mapTask({ id: 7, status: "in_progress" })).toMatchObject({
      id: "7",
      title: "Sem título",
      description: "",
      status: TaskStatus.IN_PROGRESS,
    });
  });

  it("usa PENDING para status desconhecido", () => {
    expect(mapTask({ id: "1", status: "???" }).status).toBe(TaskStatus.PENDING);
  });
});

describe("applyFilters", () => {
  const tasks = [
    task({ id: "1", title: "Comprar pão", dueDate: "2026-01-10T00:00:00" }),
    task({ id: "2", title: "Almoçar", dueDate: "2026-01-05T00:00:00" }),
    task({ id: "3", title: "Estudar", status: TaskStatus.COMPLETED }),
  ];

  it("filtra por busca no título, ignorando maiúsculas", () => {
    const result = applyFilters(tasks, { search: "PÃO", sortBy: "title" });
    expect(result.map((t) => t.id)).toEqual(["1"]);
  });

  it("ordena por data limite (sem data vai para o fim)", () => {
    const result = applyFilters(tasks, { search: "", sortBy: "dueDate" });
    expect(result.map((t) => t.id)).toEqual(["2", "1", "3"]);
  });

  it("ordena por título", () => {
    const result = applyFilters(tasks, { search: "", sortBy: "title" });
    expect(result.map((t) => t.title)).toEqual(["Almoçar", "Comprar pão", "Estudar"]);
  });

  it("não muta o array original", () => {
    const original = [...tasks];
    applyFilters(tasks, { search: "", sortBy: "title" });
    expect(tasks).toEqual(original);
  });
});

describe("buildStats", () => {
  it("conta cada status", () => {
    const stats = buildStats([
      task({ id: "1" }),
      task({ id: "2", status: TaskStatus.COMPLETED }),
      task({ id: "3", status: TaskStatus.IN_PROGRESS }),
      task({ id: "4", status: TaskStatus.CANCELLED }),
    ]);
    expect(stats).toEqual({ total: 4, pending: 1, inProgress: 1, completed: 1, cancelled: 1 });
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("retorna a fatia correta", () => {
    expect(paginate(items, 2, 10).pageItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("limita a página ao total disponível", () => {
    expect(paginate(items, 99, 10)).toMatchObject({ page: 3, totalPages: 3 });
  });

  it("lida com lista vazia", () => {
    expect(paginate([], 1, 10)).toMatchObject({ pageItems: [], totalPages: 1, totalItems: 0 });
  });
});
