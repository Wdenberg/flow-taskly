import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";

interface ColdStartNoticeProps {
  active: boolean;
  /** Só aparece se a espera passar deste limite (ms). */
  delayMs?: number;
}

/**
 * A API está hospedada no Render (plano gratuito): o primeiro acesso após um
 * período ocioso pode levar ~30s enquanto o servidor "acorda". Sem esse aviso
 * a espera parece um travamento.
 */
export function ColdStartNotice({ active, delayMs = 4000 }: ColdStartNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
    >
      <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        O servidor da API está iniciando (hospedagem gratuita hiberna quando ociosa). Isso pode
        levar até 30 segundos no primeiro acesso — em seguida tudo fica rápido.
      </p>
    </div>
  );
}
