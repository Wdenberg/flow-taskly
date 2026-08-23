import React from 'react';
// Estamos no modo build. coloque os cards de estatística um abaixo do outro
import { Link } from "@tanstack/react-router";
import { CircleDashed, ListChecks, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { formatDate } from "@/core/utils/date";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useTaskStats } from "../hooks/use-tasks";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="surface-card flex min-w-0 items-center gap-2 p-3 md:gap-4 md:p-5 aspect-square flex-col justify-center text-center md:aspect-auto md:flex-row md:justify-start md:text-left rounded-xl md:rounded-2xl w-[150px] mx-auto md:w-full">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary md:size-11 md:rounded-xl">
        <Icon className="size-4 md:size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tracking-tight md:text-2xl">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, tasks, isLoading, isError, refetch } = useTaskStats();
  const recent = [...tasks].slice(0, 5);

  return (
    <AppLayout
      title={`Olá, ${user?.name?.split(" ")[0] ?? "bem-vindo"}`}
      description="Um resumo rápido do seu progresso."
      actions={
        <Button asChild>
          <Link to="/tasks">
            Ver tarefas
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-6">
          <div className="stats-grid grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square md:aspect-auto md:h-24 rounded-xl md:rounded-2xl w-[150px] mx-auto md:w-full" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="stats-grid grid-cols-2 md:grid-cols-4">
            <StatCard label="Total" value={stats.total} icon={ListChecks} />
            <StatCard label="Pendentes" value={stats.pending} icon={CircleDashed} />
            <StatCard label="Em andamento" value={stats.inProgress} icon={Loader2} />
            <StatCard label="Concluídas" value={stats.completed} icon={CheckCircle2} />
          </div>

          <section className="surface-card min-w-0 p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Tarefas recentes</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/tasks">Ver todas</Link>
              </Button>
            </div>

            {recent.length === 0 ? (
              <EmptyState
                title="Nada por aqui ainda"
                description="Crie sua primeira tarefa para acompanhar seu progresso."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/tasks/$taskId"
                        params={{ taskId: task.id }}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Limite: {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <StatusBadge status={task.status} className="shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </section>
          
        </div>
      )}
    </AppLayout>
  );
}
