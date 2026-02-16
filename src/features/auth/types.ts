export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
}

export interface Instance {
  id: string;
  name: string;
  status: string;
  apiKey?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  instances: Instance[];
  selectedInstanceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface SelectInstanceRequest {
  instanceId: string;
}

export interface RequestResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
