import { api } from "@/lib/api-client";

const instanceScope = { tokenScope: "instance" as const };

export async function sendOtp(phone: string): Promise<void> {
  await api.post<void>(
    "/api/v1/otp/send",
    { phone },
    instanceScope,
  );
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  await api.post<void>(
    "/api/v1/otp/verify",
    { phone, code },
    instanceScope,
  );
}