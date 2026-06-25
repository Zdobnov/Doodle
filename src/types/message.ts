/** A chat message as returned by the backend. */
export type Message = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  cursorCreatedAt?: string;
  isPending?: boolean;
};

export type ApiMessage = {
  id?: string | number;
  author?: string;
  message?: string;
  createdAt?: string;
  created_at?: string;
  timestamp?: string;
  date?: string;
};

/** Request body for POST /api/v1/messages. */
export type SendMessagePayload = {
  author: string;
  message: string;
};
