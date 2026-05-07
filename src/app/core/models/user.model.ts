export interface User {
  id: string;
  login: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  login: string;
}
