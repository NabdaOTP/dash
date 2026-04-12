import { api } from "@/lib/api-client";
import type { User } from "@/features/auth/types";

export async function updateProfile(data: {
  name?: string;
  phone?: string;
  email?: string;
}): Promise<User> {
  return api.patch<User>("/api/v1/users/me", data);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return api.patch<void>("/api/v1/users/me/password", data);
}

export async function enable2fa(): Promise<void> {
  return api.post<void>("/api/v1/auth/enable-2fa");
}

export async function confirm2fa(code: string): Promise<void> {
  return api.post<void>("/api/v1/auth/confirm-2fa", { code });
}

export async function requestDisable2fa(): Promise<void> {
  return api.post<void>("/api/v1/auth/request-disable-2fa");
}

export async function disable2fa(code: string): Promise<void> {
  return api.post<void>("/api/v1/auth/disable-2fa", { code });
}

// Referrals
export interface ReferralHistory {
  id: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  contactDetails: string;
  status: string;
  createdAt: string;
}

export interface ReferralStats {
  referralCode: string;
  totalPoints: number;
  withdrawals: WithdrawalRequest[];
  history: ReferralHistory[];
  withdrawalsMeta: { total: number; page: number; limit: number; pages: number };
  historyMeta: { total: number; page: number; limit: number; pages: number };
}

export async function getReferralStats(params?: {
  withdrawalsPage?: number;
  historyPage?: number;
}): Promise<ReferralStats> {
  const query = new URLSearchParams();
  if (params?.withdrawalsPage) query.set("withdrawalsPage", String(params.withdrawalsPage));
  if (params?.historyPage) query.set("historyPage", String(params.historyPage));
  const qs = query.toString();
  return api.get<ReferralStats>(`/api/v1/referrals/stats${qs ? `?${qs}` : ""}`);
}

export async function submitWithdrawal(data: {
  amount: number;
  contactDetails: string;
}): Promise<void> {
  return api.post<void>("/api/v1/referrals/withdraw", data);
}