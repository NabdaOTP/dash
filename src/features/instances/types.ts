export interface Instance {
  id: string;
  name: string;
  status: "PAYMENT_PENDING" | "ACTIVE" | "TRIAL" | "active" | "inactive" | "error" | "SUSPENDED";
  apiKey: string;
  token: string;
  apiId: string;
  createdAt: string;
  otpSent?: number;
  otpVerified?: number;
  slug: string;
  ownerId: string;
  webhookUrl: string | null;
  webhookEnabled: boolean;
  updatedAt: string;
  deletedAt: string | null;
  trialEnd?: string | null;
  expiresAt?: string | null;
  isTrialInstance?: boolean;
}
