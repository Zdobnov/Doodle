import { request } from './client';
import type { ApiMessage, SendMessagePayload } from '../types/message';

const MESSAGES_PATH = '/api/v1/messages';

/** Fetch messages, optionally paginated by timestamp. */
export function getMessages(
  after?: string,
  limit?: number,
): Promise<ApiMessage[]> {
  return request<ApiMessage[]>(MESSAGES_PATH, {
    method: 'GET',
    params: { after, limit },
  });
}

/** Send a new chat message. */
export function sendMessage(
  author: string,
  message: string,
): Promise<ApiMessage> {
  const payload: SendMessagePayload = { author, message };

  return request<ApiMessage>(MESSAGES_PATH, {
    method: 'POST',
    body: payload,
  });
}
