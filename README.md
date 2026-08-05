# Task Flow

# TaskFlow - Gerenciador de Tarefas

## Objetivo

Desenvolva uma aplicação web moderna chamada **TaskFlow**, focada em gerenciamento de tarefas pessoais, seguindo os princípios da **Clean Architecture**, Componentização e boas práticas de desenvolvimento Front-end.

A aplicação deve possuir autenticação de usuários, gerenciamento completo de tarefas e uma interface moderna, minimalista e responsiva.

---

# Stack Obrigatória

- React 19
- TypeScript
- Vite
- React Router DOM
- Zustand (Gerenciamento de Estado)
- Axios
- React Hook Form
- Zod (Validação)
- React Query (TanStack Query) para cache da API
- Componentização
- CSS Modules ou TailwindCSS (preferencialmente Tailwind)

Arquitetura obrigatória:

- Clean Architecture
- Feature First
- SOLID
- Repository Pattern
- Services
- Hooks personalizados
- Separação de responsabilidades

---

# Estrutura do Projeto

src/

app/

routes/

providers/

core/

api/

http/

config/

errors/

types/

utils/

features/

auth/

pages/

components/

hooks/

services/

repositories/

schemas/

store/

tasks/

pages/

components/

hooks/

services/

repositories/

schemas/

store/

shared/

components/

layout/

ui/

icons/

inputs/

buttons/

cards/

modals/

tables/

empty-state/

loading/

assets/

styles/

---

# Paleta de Cores

## Background

#faf8ff

## Primary

#8685ef

## Text

#222222

## Secondary

#383645

Criar um design moderno inspirado em:

- Notion
- Linear
- Todoist
- Vercel Dashboard

Características:

- Bordas arredondadas
- Sombras suaves
- Muito espaço em branco
- Tipografia limpa
- Responsivo
- Dark Mode (opcional)

---

# Funcionalidades

## Autenticação

### Login

Endpoint

POST

https://task-api-9vu0.onrender.com/api/v1/auth/login

Body

```json
{
  "email": "string",
  "password": "string"
}
Cadastro

POST

https://task-api-9vu0.onrender.com/api/v1/auth/register

{
  "name":"string",
  "email":"user@example.com",
  "password":"string"
}

Após login:

Salvar JWT
Persistir sessão
Proteger rotas
Logout
Gerenciamento de Tarefas
Listar

GET

/api/v1/tasks

Buscar por ID

GET

/api/v1/tasks/{id}

Criar

POST

/api/v1/tasks

{
"title":"string",
"description":"string",
"dueDate":"2026-08-03T15:44:26.715Z"
}
Atualizar

PUT

/api/v1/tasks/{id}

Excluir

DELETE

/api/v1/tasks/{id}

Concluir rapidamente

PATCH

/api/v1/tasks/{id}/complete

Filtrar por Status

GET

/api/v1/tasks/status/{status}

Status possíveis:

PENDING
IN_PROGRESS
COMPLETED
CANCELLED
Funcionalidades da Interface
Dashboard

Mostrar:

Total de tarefas
Pendentes
Em andamento
Concluídas
Canceladas
Lista de tarefas

Cada card deve mostrar:

título
descrição
status
data limite
data de criação

Ações:

Editar
Excluir
Concluir
Ver detalhes
Filtros

Filtrar por:

Status
Pesquisa por título
Ordenação

Ordenar por:

Data
Status
Nome
Formulário

Criar e editar tarefas utilizando:

React Hook Form
Zod

Campos:

título
descrição
data limite

Validação completa.

Estado Global

Utilizar Zustand para:

AuthStore

usuário
token
login
logout
persistência

TaskStore

tarefas
filtros
loading
busca
paginação (caso exista)
Comunicação com API

Criar:

Axios Instance

BaseURL
Interceptors
Refresh Token (caso exista)

Separar:

Services
Repository
DTOs
Componentização

Criar componentes reutilizáveis.

Exemplos:

Button

Input

Textarea

Select

Badge

Modal

Dialog

Card

Header

Sidebar

Navbar

Loader

Spinner

Toast

ConfirmDialog

EmptyState

SearchBar

StatusBadge

TaskCard

TaskList

TaskForm

TaskFilter

ProtectedRoute

Layout

UX

Implementar:

Loading

Skeleton

Empty State

Error State

Toast de sucesso

Toast de erro

Confirmação antes de excluir

Feedback visual durante chamadas da API

Requisitos Técnicos

Utilizar:

Tipagem forte
Interfaces
Types
Enums
DTOs
Custom Hooks
Repositories
Services
React Query
Clean Code
SOLID
Código reutilizável
Componentes desacoplados

Evitar:

lógica dentro dos componentes
repetição de código
funções gigantes
acoplamento
Responsividade

Desktop

Tablet

Mobile

Sidebar deve colapsar no mobile.

Extras

Implementar:

Persistência do usuário
Tema claro (e estrutura preparada para tema escuro)
Animações suaves
Transições
Ícones com Lucide React
Página 404
Página de erro
Loading global
Objetivo Final

Gerar uma aplicação completa, escalável e profissional, pronta para produção, seguindo padrões modernos de React e TypeScript, utilizando Clean Architecture, Componentização, Zustand, React Query e integração completa com a API fornecida, com código limpo, organizado, reutilizável e de fácil manutenção.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7c6856a9-21f8-49e6-963f-b7f2d4ef2f0d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
