export interface Instance {
  id: string;
  name: string;
  status: "active" | "inactive" | "error";
  apiKey: string;
  token: string;
  apiId: string;
  createdAt: string;
  otpSent?: number;
  otpVerified?: number;
}

export interface CreateInstanceResponse {
  id: string;
  name: string;
  apiKey: string;
}
