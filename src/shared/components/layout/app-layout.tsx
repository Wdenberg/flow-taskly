import type { ReactNode } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

interface AppLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ title, description, actions, children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
              {description ? (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions}
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
