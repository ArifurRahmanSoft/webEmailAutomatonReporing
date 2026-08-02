export type UserRole = 'ADMIN' | 'REPORT_VIEW';

export interface AuthSession {
  user_id: string;
  role: UserRole;
  register_date: string;
}

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface AuthUserResponse extends AuthSession {
  success: boolean;
}

export interface AuthUserListItem {
  id: string;
  user_id: string;
  role: UserRole;
  register_date: string;
  created_at: string;
  updated_at: string;
}

export interface SaveUserRequest {
  user_id: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserResponse {
  success: boolean;
  id: string;
  user_id: string;
  role: UserRole;
  register_date: string;
  updated_at: string;
}
