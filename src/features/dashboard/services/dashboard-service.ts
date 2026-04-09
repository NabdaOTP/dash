import { getMyInstances } from "@/features/instances/services/instances-service";

export interface DashboardStats {
  activeInstances: number;
  stoppedInstances: number;
}

export async function getDashboardData(): Promise<DashboardStats> {
  const instList = await getMyInstances().catch(() => []);

  const activeInstances = instList.filter(
    (i) => i.status === "ACTIVE" || i.status === "active" || i.status === "TRIAL"
  ).length;

  const stoppedInstances = instList.filter(
    (i) => i.status === "PAYMENT_PENDING" || i.status === "inactive" || i.status === "error" || i.status === "SUSPENDED"
  ).length;

  return { activeInstances, stoppedInstances };
}