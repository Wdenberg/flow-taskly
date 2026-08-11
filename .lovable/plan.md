# Integração completa da API de tarefas (prioridade + subtarefas)

O projeto já tem toda a infraestrutura necessária: proxy same-origin (`/api/public/task-api`), cliente Axios único com interceptors de auth/erro, camadas repository → service → hooks (React Query) → páginas, Zustand para filtros, sonner para toasts, `ConfirmDialog` para ações destrutivas e Zod + React Hook Form nos formulários. O plano reutiliza tudo isso — nenhuma dependência nova, nenhum redesenho.

## O que muda para o usuário

- Cada tarefa passa a ter **prioridade** (Baixa, Média, Alta, Urgente), exibida como selo no card e no detalhe, e escolhida no formulário de criação/edição.
- Novo **filtro por prioridade** na barra de filtros, ao lado do filtro de status.
- Filtro de status e de prioridade passam a consultar a API (`/tasks/status/{status}` e `/tasks/priority/{priority}`) em vez de filtrar só no cliente.
- Na página de detalhes da tarefa: lista de **subtarefas** com checkbox para concluir/desconcluir, campo para adicionar nova subtarefa e botão de remover (com confirmação), cada ação com loading isolado.
- O card de tarefa mostra o progresso das subtarefas (ex.: "2/5 concluídas") quando existirem.

## Alterações técnicas

### Tipos (`src/core/types/task.ts`)
- Adicionar `TaskPriority` (LOW, MEDIUM, HIGH, URGENT) no mesmo padrão do `TaskStatus`: objeto const + type + `TASK_PRIORITIES` + `TASK_PRIORITY_LABEL`.
- Adicionar `Subtask { id, title, completed }` e `SubtaskDTO`.
- Estender `Task`/`TaskDTO` com `priority` e `subtasks: Subtask[]`.
- Estender `CreateTaskInput` com `priority`; `TaskFilters` ganha `priority: TaskPriority | "ALL"`.

### Endpoints (`src/core/api/config/api.config.ts`)
Acrescentar em `API_ENDPOINTS.tasks`: `byPriority(p)`, `subtasks(taskId)`, `subtaskById(taskId, subtaskId)`, `toggleSubtask(taskId, subtaskId)`. A base URL continua centralizada no proxy existente — sem nova variável de ambiente.

### Repository (`task.repository.ts`)
Novos métodos usando o `httpClient` atual: `listByPriority`, `addSubtask`, `toggleSubtask`, `removeSubtask`. `create`/`update` passam a enviar `priority` junto com o `dueDate` já normalizado para `LocalDateTime` (regra atual mantida).

### Service (`task.service.ts`)
- `mapTask` passa a mapear `priority` (fallback MEDIUM) e `subtasks` (fallback `[]`) via novo `mapSubtask`.
- `list` recebe `{ status, priority }` e escolhe o endpoint: prioridade → `/priority/{p}`, status → `/status/{s}`, ambos ALL → `/tasks`. Se os dois estiverem definidos, busca por status e refina a prioridade em memória (a API não tem endpoint combinado).
- `applyFilters` deixa de refazer o filtro de status/prioridade já resolvido no servidor; mantém busca por texto e ordenação.
- Novos métodos: `addSubtask`, `toggleSubtask`, `removeSubtask`, retornando a tarefa mapeada da resposta da API.

### Hooks
- `use-tasks.ts`: `taskKeys.list` passa a considerar status + prioridade; `useTasks` lê o novo filtro do store.
- `use-task-mutations.ts`: novas mutations `addSubtask`, `toggleSubtask`, `removeSubtask` seguindo o padrão atual — update otimista com snapshot/rollback para toggle e remoção, escrita da tarefa retornada pela API no cache em `onSuccess`, toast de erro amigável, `invalidate` no `onSettled`. `completeTask` já usa `PATCH /complete`.

### Store (`task-filters.store.ts`)
Campo `priority` + `setPriority` (reseta para página 1), incluído no `reset`.

### UI (sem mudança de layout)
- `PriorityBadge` novo em `shared/components/ui/`, espelhando o `StatusBadge` existente e usando tokens semânticos já definidos.
- `task-filters.tsx`: mais um `Select` de prioridade no mesmo padrão dos atuais.
- `task-card.tsx`: selo de prioridade ao lado do de status e contador de subtarefas.
- `task-form.tsx` + `task.schema.ts`: campo de prioridade (default MEDIUM) validado por enum Zod.
- `task-detail-page.tsx`: bloco de subtarefas com input de adição (bloqueia título vazio/só espaços e envio duplicado), checkbox por item, botão de remover com `ConfirmDialog`, spinners por item.

### Erros, datas e testes
- Tratamento de erro continua via `mapHttpError`/`AppError` e toasts do sonner — nenhum erro técnico exposto.
- Datas: envio ISO pela normalização já existente; exibição só por `formatDate`/`formatDateTime`.
- Estender `task.service.test.ts` com casos de mapeamento de prioridade/subtarefas e de escolha de endpoint por filtro.
- Ao final, validar os fluxos (listar, criar, filtrar por status e prioridade, adicionar/alternar/remover subtarefa, concluir) contra a API real via proxy.
