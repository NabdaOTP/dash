import { api } from "@/lib/api-client";
import type { WhatsAppStatus, WhatsAppQrResponse } from "../types";

export async function connect(): Promise<void> {
  return api.post<void>("/api/v1/whatsapp/connect");
}

export async function getQrCode(): Promise<WhatsAppQrResponse> {
  return api.get<WhatsAppQrResponse>("/api/v1/whatsapp/qr");
}

export async function getStatus(): Promise<WhatsAppStatus> {
  return api.get<WhatsAppStatus>("/api/v1/whatsapp/status");
}

export async function disconnect(): Promise<void> {
  return api.post<void>("/api/v1/whatsapp/disconnect");
}

export async function restart(): Promise<void> {
  return api.post<void>("/api/v1/whatsapp/restart");
}

export async function healthCheck(): Promise<{ status: string }> {
  return api.get<{ status: string }>("/api/v1/whatsapp/health");
}
