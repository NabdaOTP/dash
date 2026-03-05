export interface Message {
  id: string;
  phone: string;
  message: string;
  status: "queued" | "sent" | "invalid";
  createdAt: string;
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

