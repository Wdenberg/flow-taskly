export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_TOKEN: "Sua sessão expirou. Por favor, faça login novamente.",
    SESSION_EXPIRED: "Sua sessão expirou. Por favor, faça login novamente.",
    NOT_AUTHENTICATED: "Você precisa estar autenticado para continuar.",
  },
  NETWORK: {
    ERROR: "Erro de conexão. Verifique sua internet e tente novamente.",
  },
  HTTP: {
    GENERIC: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    NOT_FOUND: "O recurso solicitado não foi encontrado.",
    SERVER_ERROR: "Erro interno do servidor. Tente novamente mais tarde.",
  },
  VALIDATION: {
    REQUIRED_FIELD: "Este campo é obrigatório.",
    INVALID_EMAIL: "Digite um e-mail válido.",
    PASSWORD_MIN_LENGTH: "A senha deve ter pelo menos 6 caracteres.",
  },
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
