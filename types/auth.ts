export type AuthMethod = 'email' | 'phone';

export type UserType = 'guest' | 'user';

export interface User {
  id: string;
  type: UserType;
  email?: string;
  phone?: string;
  name?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}
