export interface WhatsAppStatus {
  status: "connected" | "disconnected" | "connecting" | "qr_ready"| "reconnecting";
  phone?: string;
  connectedAt?: string;
}

export interface WhatsAppQrResponse {
  qr: string;
}
