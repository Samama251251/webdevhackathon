export interface User {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

