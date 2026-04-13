import { getMyInstances } from "@/features/instances/services/instances-service";
import { getReferralStats } from "@/features/referrals/services/referrals-service";

export interface DashboardStats {
  activeInstances: number;
  stoppedInstances: number;
  totalPoints: number;
}

export async function getDashboardData(): Promise<DashboardStats> {
  const [instancesResult, referralResult] = await Promise.allSettled([
    getMyInstances(),
    getReferralStats(),
  ]);

  const instList = instancesResult.status === "fulfilled" ? instancesResult.value : [];
  const totalPoints = referralResult.status === "fulfilled" ? referralResult.value.totalPoints : 0;

  const activeInstances = instList.filter(
    (i) => i.status === "ACTIVE" || i.status === "active" || i.status === "TRIAL"
  ).length;

  const stoppedInstances = instList.filter(
    (i) => i.status === "PAYMENT_PENDING" || i.status === "inactive" || i.status === "error" || i.status === "SUSPENDED"
  ).length;

  return { activeInstances, stoppedInstances, totalPoints };
}