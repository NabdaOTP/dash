export interface WhatsAppStatus {
  connected: boolean;
  phone?: string;
  sessionExpiresIn?: string;
}

export interface WhatsAppQrResponse {
  qr: string;
}
