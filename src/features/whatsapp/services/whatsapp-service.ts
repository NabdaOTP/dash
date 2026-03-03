import { api } from "@/lib/api-client";
import type { WhatsAppStatus, WhatsAppQrResponse } from "../types";

const instanceScope = { tokenScope: "instance" as const };

// export async function connect(): Promise<void> {
//   return api.post<void>("/api/v1/whatsapp/connect", undefined, instanceScope);
// }
export async function connect(): Promise<void> {
  return api.post<void>(
    "/api/v1/whatsapp/connect",
    null,
    {
      tokenScope: "instance",
      headers: {},
    }
  );
}
export async function getQrCode(): Promise<WhatsAppQrResponse> {
  return api.get<WhatsAppQrResponse>("/api/v1/whatsapp/qr", instanceScope);
}

export async function getStatus(): Promise<WhatsAppStatus> {
  return api.get<WhatsAppStatus>("/api/v1/whatsapp/status", instanceScope);
}

export async function disconnect(): Promise<void> {
  return api.post<void>("/api/v1/whatsapp/disconnect", undefined, instanceScope);
}

export async function restart(): Promise<void> {
  return api.post<void>("/api/v1/whatsapp/restart", undefined, instanceScope);
}

export async function healthCheck(): Promise<{ status: string }> {
  return api.get<{ status: string }>("/api/v1/whatsapp/health", instanceScope);
}