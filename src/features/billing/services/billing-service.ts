import { api } from "@/lib/api-client";
import type { Plan, Invoice } from "../types";

export async function getPlans(): Promise<Plan[]> {
  return api.get<Plan[]>("/api/v1/plans");
}

export async function subscribe(planId: string): Promise<void> {
  return api.post<void>("/api/v1/subscriptions/subscribe", { planId });
}

export async function startTrial(planId: string): Promise<void> {
  return api.post<void>("/api/v1/subscriptions/trial/start", { planId });
}

export async function extendTrial(): Promise<void> {
  return api.post<void>("/api/v1/subscriptions/trial/extend");
}

export async function setAutoRenew(autoRenew: boolean): Promise<void> {
  return api.patch<void>("/api/v1/subscriptions/auto-renew", { autoRenew });
}

export async function getInvoices(): Promise<Invoice[]> {
  return api.get<Invoice[]>("/api/v1/billing/invoices");
}
