# Internacionalização completa (pt-BR, en, es)

Adicionar i18next + react-i18next ao TaskFlow, com seletor de idioma, persistência, detecção automática e migração de todos os textos visíveis — sem alterar design, layout ou funcionalidades.

## Idiomas
- pt-BR (padrão e fallback), en, es.
- Primeira visita: detecta o idioma do navegador; qualquer idioma fora da lista cai em pt-BR.
- Escolha salva em localStorage (`taskflow.language`) e reaplicada ao reabrir o navegador.
- Troca de idioma instantânea, sem recarregar a página.

## Estrutura das traduções (pronta para reuso no React Native)
```text
src/locales/
  pt-BR/  common.json navigation.json auth.json home.json tasks.json dashboard.json errors.json
  en/     (mesmos arquivos)
  es/     (mesmos arquivos)
  index.ts   -> monta o objeto de resources
```
Os JSON ficam puros (sem imports de web), então o app React Native poderá consumir a mesma pasta — no futuro basta extrair `src/locales` para um pacote compartilhado; apenas o arquivo de init (detector/persistência) é específico de cada plataforma.

## Configuração
- `src/shared/i18n/config.ts`: init do i18next com namespaces acima, `fallbackLng: "pt-BR"`, `defaultNS: "common"`, `interpolation.escapeValue: false`.
- Detecção/persistência própria (leitura de localStorage + `navigator.language`) aplicada após a hidratação, evitando divergência entre servidor e navegador no SSR do TanStack Start.
- Provider montado uma única vez em `src/routes/__root.tsx`, junto ao QueryClientProvider.

## Seletor de idioma
- Novo `src/shared/components/ui/language-selector.tsx`, no mesmo padrão visual do `ThemeToggle` (botão ícone + dropdown com PT/EN/ES).
- Posicionado ao lado do ThemeToggle no header do `AppLayout` e na navbar da home; sem mudanças de espaçamento ou cores.

## Textos a migrar
- Home (`src/routes/index.tsx`): hero, features, navbar, footer.
- Auth: login, registro, labels, placeholders, botões, mensagens do `use-auth`.
- Tarefas: cards, filtros, formulário, diálogos, subtarefas, paginação, empty/error states, avisos de cold start, toasts de sucesso/erro e “Desfazer”.
- Dashboard: título, descrição, cards de estatística, tarefas recentes.
- Sidebar, layout, página 404 e tela de erro do root.
- Enums exibidos (status e prioridade) passam a ser traduzidos na camada de apresentação; os valores internos (`PENDING`, `HIGH`, etc.) permanecem intactos.
- Mensagens de erro de `src/core/errors/messages.ts` e as mensagens do Zod (`auth.schema.ts`, `task.schema.ts`) passam a usar chaves de tradução resolvidas no ponto de exibição.

## Não muda
- Layout, cores, espaçamentos, responsividade, rotas, regras de negócio, chamadas de API, nomes de variáveis/classes/IDs.

## Verificação final
- Typecheck e build.
- Trocar idioma sem reload; recarregar a página e confirmar persistência.
- Conferir que nenhuma tela relevante mantém texto fixo e que chaves ausentes caem em pt-BR.
