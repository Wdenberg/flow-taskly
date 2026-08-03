# TaskFlow — Gerenciador de Tarefas

Aplicação completa de gerenciamento de tarefas com autenticação JWT, dashboard, CRUD de tarefas, filtros e UI moderna (inspiração Linear/Notion/Todoist), integrada à API `https://task-api-9vu0.onrender.com`.

## Duas adaptações à stack pedida

1. **Roteamento**: este projeto usa TanStack Router (fixo na plataforma). Não é possível usar React Router DOM. Todos os requisitos (rotas, rotas protegidas, 404, página de erro, layout) serão atendidos com TanStack Router.
2. **HTTP**: manterei a camada `http` isolada (interceptors, baseURL, token) — usando Axios instalado como dependência, conforme pedido, encapsulado num único módulo para que trocá-lo não afete services/repositories.

Zustand (com persist), React Query, React Hook Form, Zod, Tailwind, Lucide serão usados exatamente como pedido.

## Design

- Paleta: background `#faf8ff`, primary `#8685ef`, texto `#222222`, secundário `#383645` — convertidos em tokens oklch em `src/styles.css`.
- Cantos arredondados, sombras suaves, muito espaço em branco, tipografia limpa, transições suaves.
- Estrutura de tema preparada para dark mode.

## Telas

- `/` — landing/redirect: se autenticado vai para dashboard, senão para login.
- `/login` e `/register` — formulários com RHF + Zod, feedback de erro da API, toasts.
- `/dashboard` (protegida) — cards de resumo: total, pendentes, em andamento, concluídas, canceladas.
- `/tasks` (protegida) — lista de tarefas com busca por título, filtro por status, ordenação (data, status, nome), criação/edição em modal, exclusão com confirmação, concluir rápido.
- `/tasks/$id` (protegida) — detalhes da tarefa.
- 404 e página de erro global.

Layout com sidebar (colapsável no mobile), header com usuário e logout. Responsivo desktop/tablet/mobile.

## Estados de UX

Loading global, skeletons na lista e no dashboard, empty state, error state com retry, toasts de sucesso/erro (sonner), diálogo de confirmação antes de excluir, botões com estado de carregamento.

## Arquitetura (feature-first + clean architecture)

```text
src/
  app/providers/            QueryClient, Toaster, AuthBootstrap
  core/
    api/http/               axios instance, interceptors (Bearer, 401 -> logout)
    api/config/             base URL, endpoints
    errors/                 AppError, mapeamento de erros HTTP
    types/                  tipos e enums compartilhados (TaskStatus, ApiResponse)
    utils/                  formatadores de data, sort/filter helpers
  features/
    auth/{pages,components,hooks,services,repositories,schemas,store}
    tasks/{pages,components,hooks,services,repositories,schemas,store}
  shared/
    components/layout/      AppLayout, Sidebar, Header, ProtectedRoute
    components/ui/          Button, Input, Textarea, Select, Badge, Modal,
                            ConfirmDialog, Card, EmptyState, Loader, Skeleton,
                            SearchBar, StatusBadge
  routes/                   arquivos de rota finos que apenas montam as pages
```

Regras: componentes sem lógica de negócio; repositories falam com o HTTP e devolvem DTOs; services aplicam regras e mapeiam DTO -> modelo de domínio; hooks (`useTasks`, `useTaskMutations`, `useAuth`) encapsulam React Query + Zustand; rotas só compõem.

## Detalhes técnicos

- **AuthStore (Zustand + persist)**: `user`, `token`, `login`, `register`, `logout`, hidratação no boot; token injetado no interceptor de request; 401 dispara logout e redirect para `/login`.
- **TaskStore (Zustand)**: filtros (status, busca, ordenação) — dados de servidor ficam no React Query, não duplicados no store.
- **React Query**: `queryKey` `['tasks', filtros]` e `['task', id]`; mutations de criar/atualizar/excluir/concluir invalidam as chaves relevantes; loaders de rota permanecem leves (a API é externa e exige token do cliente, então as buscas acontecem no componente, não em loader SSR).
- **Endpoints**: login, register, GET/POST/PUT/DELETE `/tasks`, PATCH `/tasks/{id}/complete`, GET `/tasks/status/{status}`. Filtro por status usa o endpoint dedicado quando um status é escolhido; busca e ordenação são aplicadas no cliente.
- **Zod**: schemas de login, registro e tarefa (título obrigatório com limite, descrição opcional com limite, data limite válida) usados tanto no formulário quanto para validar respostas da API.
- **SEO/head**: cada rota de conteúdo com title/description/og próprios.
- Dependência a instalar: `axios`, `zustand`.

## Verificação

Build/typecheck limpos e um passeio no preview: registrar/entrar, criar, editar, concluir e excluir tarefa, filtros e responsividade mobile.
