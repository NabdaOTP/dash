import { api } from "@/lib/api-client";
import type { MessagesResponse, SendMessageRequest } from "../types";

const instanceScope = { tokenScope: "instance" as const };

export async function getMessages(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<MessagesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return api.get<MessagesResponse>(
    `/api/v1/messages${query ? `?${query}` : ""}`,
    instanceScope,
  );
}


export async function sendMessage(body: SendMessageRequest): Promise<void> {
  await api.post<void>("/api/v1/messages/send", body, instanceScope);
}

