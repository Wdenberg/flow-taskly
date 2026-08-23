import { type ReactNode } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { AppSidebar } from "./app-sidebar";

interface AppLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

// A proteção de rota vive em `src/routes/_authenticated/route.tsx` (beforeLoad),
// então aqui só cuidamos do chrome da aplicação.
export function AppLayout({ title, description, actions, children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
            <SidebarTrigger aria-label="Alternar menu lateral" />
            <div className="min-w-0 flex-1">
              <h1
                className="truncate font-semibold tracking-tight"
                style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)" }}
              >
                {title}
              </h1>
              {description ? (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              {actions}
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-6xl animate-in fade-in duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
