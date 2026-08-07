import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row"
      aria-label="Paginação de tarefas"
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Mostrando {first}–{last} de {totalItems} tarefas
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <span className="text-sm font-medium tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
