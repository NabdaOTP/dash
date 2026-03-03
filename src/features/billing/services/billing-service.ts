import { api } from "@/lib/api-client";
import type { Plan, Invoice, CurrentSubscription } from "../types";

const instanceScope = { tokenScope: "instance" as const };

export async function getCurrentSubscription(): Promise<CurrentSubscription | null> {
  try {
    return await api.get<CurrentSubscription>("/api/v1/subscriptions/current", instanceScope);
  } catch {
    return null;
  }
}

export async function getPlans(): Promise<Plan[]> {
  const result = await api.get<Plan | Plan[]>("/api/v1/plans");
  return Array.isArray(result) ? result : [result];
}


export async function subscribe(planId: string): Promise<{ url?: string; checkoutUrl?: string }> {
  return api.post<{ url?: string; checkoutUrl?: string }>(
    "/api/v1/subscriptions/subscribe",
    { planId },
    instanceScope   
  );
}

export async function startTrial(planId: string): Promise<{ url?: string }> {
  return api.post<{ url?: string }>(
    "/api/v1/subscriptions/trial/start",
    { planId },
    instanceScope
  );
}

export async function extendTrial(): Promise<void> {
  return api.post<void>("/api/v1/subscriptions/trial/extend", undefined, instanceScope);
}

export async function setAutoRenew(autoRenew: boolean): Promise<void> {
  return api.patch<void>("/api/v1/subscriptions/auto-renew", { autoRenew }, instanceScope);
}

export async function getInvoices(): Promise<Invoice[]> {
  return api.get<Invoice[]>("/api/v1/billing/invoices");
}
