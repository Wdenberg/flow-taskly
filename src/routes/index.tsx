import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Layout, Smartphone, Globe, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TaskFlow — Organize suas tarefas. Simplifique seu dia." },
      {
        name: "description",
        content:
          "O Task Flow é o app de tarefas que mantém tudo organizado em um só lugar — no navegador, Android e iOS.",
      },
      { property: "og:title", content: "TaskFlow — Gerenciamento de Tarefas" },
      {
        property: "og:description",
        content:
          "Planeje seu dia, acompanhe suas tarefas e transforme o que precisa ser feito em resultados.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const hasValidToken = useAuthStore((state) => state.hasValidToken);
  const isLoggedIn = hasValidToken();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button asChild variant="default">
              <Link to="/dashboard">Ir para o App</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild variant="default">
                <Link to="/register">Começar agora</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pt-24 pb-32 md:pt-32 md:pb-48">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 blur-3xl opacity-20 dark:opacity-10 pointer-events-none">
             <div className="h-[500px] w-[800px] bg-primary rounded-full"></div>
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-5xl font-extrabold tracking-tight sm:text-7xl">
              Task Flow
            </h1>
            <p className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-700 text-2xl font-medium text-muted-foreground sm:text-3xl">
              Organize suas tarefas. Simplifique seu dia.
            </p>
            <p className="mx-auto mt-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 text-lg text-muted-foreground/80 leading-relaxed">
              O Task Flow é o app de tarefas que mantém tudo organizado em um só lugar — no navegador, Android e iOS (futuro).
            </p>
            <p className="mx-auto mt-4 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 text-lg text-muted-foreground/80 leading-relaxed">
              Planeje seu dia, acompanhe suas tarefas e transforme o que precisa ser feito em resultados. Simples, rápido e sempre com você.
            </p>
            
            <div className="mt-12 flex animate-in fade-in slide-in-from-bottom-10 duration-700 flex-col items-center justify-center gap-4 sm:flex-row px-4 sm:px-0">
              <Button asChild size="lg" className="w-full sm:w-auto h-auto min-h-14 py-4 px-8 text-lg font-semibold shadow-lg shadow-primary/20 whitespace-normal text-center">
                <Link to={isLoggedIn ? "/dashboard" : "/register"}>
                  Comece agora e coloque sua rotina em fluxo
                  <ArrowRight size={20} className="ml-2 inline-block shrink-0" />
                </Link>
              </Button>
              {!isLoggedIn && (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-auto min-h-14 py-4 px-8 text-lg font-semibold">
                  <Link to="/login">Ver demonstração</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="border-t bg-muted/30 py-24 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <FeatureCard 
                icon={<Globe className="text-primary" size={32} />}
                title="Sempre Web"
                description="Acesse suas tarefas de qualquer lugar através do navegador com sincronização em tempo real."
              />
              <FeatureCard 
                icon={<Smartphone className="text-primary" size={32} />}
                title="Mobile First"
                description="Interface pensada para fluidez em dispositivos Android e iOS, garantindo produtividade móvel."
              />
              <FeatureCard 
                icon={<Zap className="text-primary" size={32} />}
                title="Performance"
                description="Criado com as tecnologias mais modernas para ser extremamente rápido e responsivo."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-6 bg-background text-muted-foreground">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">TaskFlow</span>
          </div>
          <p className="text-sm text-center">
            &copy; {new Date().getFullYear()} TaskFlow. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-background shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="mb-4 p-3 rounded-xl bg-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

