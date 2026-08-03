export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponseDTO {
  accessToken?: string;
  access_token?: string;
  token?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: UserDTO;
  };
  user?: UserDTO;
  id?: string | number;
  name?: string;
  email?: string;
}

export interface UserDTO {
  id?: string | number;
  _id?: string;
  name?: string;
  email?: string;
}
