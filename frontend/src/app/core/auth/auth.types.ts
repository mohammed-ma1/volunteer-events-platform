export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: LearnerUser;
}

export interface LearnerUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}
