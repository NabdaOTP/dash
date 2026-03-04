import { getMyInstances } from "@/features/instances/services/instances-service";
import { getStatus } from "@/features/whatsapp/services/whatsapp-service";
import { getMessages } from "@/features/messages/services/messages-service";

export interface DashboardStats {
  instanceName: string;
  whatsappConnected: boolean;
  whatsappPhone?: string;
  totalMessages: number;
  activeInstances: number;
  stoppedInstances: number;
}

export async function getDashboardData(): Promise<DashboardStats> {
  const [allInstances, whatsappStatus, messages] = await Promise.allSettled([
    getMyInstances(),
    getStatus(),
    getMessages({ limit: 1 }),
  ]);

  const instList = allInstances.status === "fulfilled" ? allInstances.value : [];

  const activeInstances = instList.filter(
    (i) => i.status === "ACTIVE" || i.status === "active" || i.status === "TRIAL"
  ).length;

  const stoppedInstances = instList.filter(
    (i) => i.status === "PAYMENT_PENDING" || i.status === "inactive" || i.status === "error"
  ).length;

  const currentInstance =
    instList.find((i) => i.status === "ACTIVE" || i.status === "active" || i.status === "TRIAL")
    ?? instList[0];

  return {
    instanceName: currentInstance?.name ?? "—",
    whatsappConnected:
      whatsappStatus.status === "fulfilled"
        ? whatsappStatus.value.status === "connected"
        : false,
    whatsappPhone:
      whatsappStatus.status === "fulfilled" ? whatsappStatus.value.phone : undefined,
    totalMessages:
      messages.status === "fulfilled" ? messages.value.total : 0,
    activeInstances,
    stoppedInstances,
  };
}