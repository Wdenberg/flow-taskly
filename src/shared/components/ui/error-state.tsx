import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Não foi possível carregar",
  message = "Ocorreu um erro ao buscar os dados. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="mr-2 size-4" />
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
