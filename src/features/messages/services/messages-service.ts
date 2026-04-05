import { api } from "@/lib/api-client";
import type { MessagesApiResponse, MessagesResponse, SendAudioRequest, SendDocumentRequest, SendImageRequest, SendMessageRequest, SendStickerRequest, SendVideoRequest, SendVoiceRequest, UploadMediaResponse } from "../types";

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
  const res = await api.get<MessagesApiResponse>(
    `/api/v1/messages${query ? `?${query}` : ""}`,
    instanceScope,
  );

  return {
    data: res?.items ?? [],
    total: res?.meta?.total ?? 0,
    page: res?.meta?.page ?? 1,
    limit: res?.meta?.limit ?? 20,
  };
}

export async function sendMessage(body: SendMessageRequest, apiKey: string): Promise<void> {
  await api.post<void>("/api/v1/messages/send", body, {
    headers: { Authorization: apiKey },
  });
}

export async function uploadMedia(file: File): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<UploadMediaResponse>(
    "/api/v1/messages/upload",
    formData,
    {
      tokenScope: "instance" as const,
      // Do NOT set Content-Type manually for FormData
      headers: {} as any,
    }
  );
}

/** Send Image */
export async function sendImage(body: SendImageRequest, apiKey?: string): Promise<void> {
  const headers = apiKey ? { Authorization: apiKey } : undefined;
  await api.post<void>("/api/v1/messages/image", body, {
    tokenScope: "instance" as const,
    headers,
  });
}

/** Send Video */
export async function sendVideo(body: SendVideoRequest, apiKey?: string): Promise<void> {
  const headers = apiKey ? { Authorization: apiKey } : undefined;
  await api.post<void>("/api/v1/messages/video", body, {
    tokenScope: "instance" as const,
    headers,
  });
}

/** Send Audio */
export async function sendAudio(body: SendAudioRequest, apiKey?: string): Promise<void> {
  const headers = apiKey ? { Authorization: apiKey } : undefined;
  await api.post<void>("/api/v1/messages/audio", body, {
    tokenScope: "instance" as const,
    headers,
  });
}

/** Send Voice Note */
export async function sendVoice(body: SendVoiceRequest, apiKey?: string): Promise<void> {
  const headers = apiKey ? { Authorization: apiKey } : undefined;
  await api.post<void>("/api/v1/messages/voice", body, {
    tokenScope: "instance" as const,
    headers,
  });
}

/** Send Document */
export async function sendDocument(body: SendDocumentRequest, apiKey?: string): Promise<void> {
  const headers = apiKey ? { Authorization: apiKey } : undefined;
  await api.post<void>("/api/v1/messages/document", body, {
    tokenScope: "instance" as const,
    headers,
  });
}

/** Send Sticker */
export async function sendSticker(body: SendStickerRequest, apiKey?: string): Promise<void> {
  const headers = apiKey ? { Authorization: apiKey } : undefined;
  await api.post<void>("/api/v1/messages/sticker", body, {
    tokenScope: "instance" as const,
    headers,
  });
}