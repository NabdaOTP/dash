import { api } from "@/lib/api-client";
import type { MessagesResponse } from "../types";

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
    `/api/v1/messages${query ? `?${query}` : ""}`
  );
}
