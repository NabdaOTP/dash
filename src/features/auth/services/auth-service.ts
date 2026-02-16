import { api } from "@/lib/api-client";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  SelectInstanceRequest,
  RequestResetRequest,
  ResetPasswordRequest,
} from "../types";

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/v1/auth/login", data);
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("/api/v1/auth/register", data);
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/v1/auth/verify-otp", data);
}

export async function selectInstance(data: SelectInstanceRequest): Promise<void> {
  return api.post<void>("/api/v1/auth/select-instance", data);
}

export async function logout(): Promise<void> {
  return api.post<void>("/api/v1/auth/logout");
}

export async function requestReset(data: RequestResetRequest): Promise<void> {
  return api.post<void>("/api/v1/auth/request-reset", data);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  return api.post<void>("/api/v1/auth/reset-password", data);
}

export async function getMe(): Promise<User> {
  return api.get<User>("/api/v1/users/me");
}
