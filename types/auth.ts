export type AuthMethod = 'email' | 'phone';

export type UserType = 'guest' | 'user';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  type: UserType;
  role?: UserRole;
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
