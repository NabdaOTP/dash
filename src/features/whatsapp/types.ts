export interface WhatsAppStatus {
  
  status: "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "QR_READY" | "RECONNECTING"
        | "connected" | "disconnected" | "connecting" | "qr_ready" | "reconnecting";
  phone?: string;
  phoneNumber?: string;  
  qr?: string | null;     
  connectedAt?: string;
  lastConnectedAt?: string;
}

export interface WhatsAppQrResponse {
  qr: string;
}