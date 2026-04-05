export interface Message {
  id: string;
  phone: string;
  message: string;
  status: "queued" | "sent" | "invalid";
  createdAt: string;
  updatedAt?: string;
}

export interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
}

export interface MessagesApiResponse {
  items: Message[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SendMessageRequest {
  phone: string;
  message: string;
}

// Media Upload
export interface UploadMediaResponse {
  mediaId: string;
}

// Extended Send Message to support media
export interface SendMessageWithMediaRequest extends SendMessageRequest {
  mediaId?: string;
  caption?: string;
  fileName?: string;
}

// ====================== Media Sending Types ======================

export interface BaseMediaRequest {
  phone: string;
  caption?: string;
  mediaId?: string;
}

export interface SendImageRequest extends BaseMediaRequest {
  mediaId: string;        // Required for image
  caption?: string;
}

export interface SendVideoRequest extends BaseMediaRequest {
  mediaId: string;
  caption?: string;
}

export interface SendAudioRequest extends BaseMediaRequest {
  mediaId: string;
}

export interface SendVoiceRequest extends BaseMediaRequest {
  mediaId: string;
}

export interface SendDocumentRequest extends BaseMediaRequest {
  mediaId: string;
  fileName?: string;
  caption?: string;
}

export interface SendStickerRequest extends BaseMediaRequest {
  mediaId: string;
}