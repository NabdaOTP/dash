import { api } from "@/lib/api-client";
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