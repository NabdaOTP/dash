import { getCurrentInstance } from "@/features/instances/services/instances-service";
import { getStatus } from "@/features/whatsapp/services/whatsapp-service";
import { getMessages } from "@/features/messages/services/messages-service";

export interface DashboardStats {
  instanceName: string;
  whatsappConnected: boolean;
  whatsappPhone?: string;
  totalMessages: number;
}

export async function getDashboardData(): Promise<DashboardStats> {
  const [instance, whatsappStatus, messages] = await Promise.allSettled([
    getCurrentInstance(),
    getStatus(),
    getMessages({ limit: 1 }),
  ]);

  return {
    instanceName:
      instance.status === "fulfilled" ? instance.value.name : "—",
    whatsappConnected:
      whatsappStatus.status === "fulfilled"
        ? whatsappStatus.value.status === "connected"
        : false,
    whatsappPhone:
      whatsappStatus.status === "fulfilled"
        ? whatsappStatus.value.phone
        : undefined,
    totalMessages:
      messages.status === "fulfilled" ? messages.value.total : 0,
  };
}
