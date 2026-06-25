import { ApiError, request } from './client';
import type { ApiMessage, SendMessagePayload } from '../types/message';

const MESSAGES_PATH = '/api/v1/messages';
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function getValidAfterTimestamp(after?: string): string | undefined {
  if (!after) {
    return undefined;
  }

  return ISO_TIMESTAMP_PATTERN.test(after) ? after : undefined;
}

/** Fetch messages, optionally paginated by timestamp. */
export function getMessages(
  after?: string,
  limit?: number,
  signal?: AbortSignal,
): Promise<ApiMessage[]> {
  return request<ApiMessage[]>(MESSAGES_PATH, {
    cache: 'no-store',
    method: 'GET',
    params: { after: getValidAfterTimestamp(after), limit },
    signal,
  }).catch((cause) => {
    if (cause instanceof ApiError && cause.status === 304) {
      return [];
    }

    throw cause;
  });
}

/** Send a new chat message. */
export function sendMessage(
  author: string,
  message: string,
  signal?: AbortSignal,
): Promise<ApiMessage> {
  const payload: SendMessagePayload = { author, message };

  return request<ApiMessage>(MESSAGES_PATH, {
    method: 'POST',
    body: payload,
    signal,
  });
}
