import { getMessages, sendMessage } from '../api/messages';
import type { Message } from '../types/message';
import { normalizeMessage, sortMessagesAscending } from '../utils/message';

const inFlightMessageRequests = new Map<string, Promise<Message[]>>();

export async function fetchChatMessages(
  after?: string,
  limit?: number,
): Promise<Message[]> {
  const requestKey = `${after ?? ''}:${limit ?? ''}`;
  const inFlightRequest = inFlightMessageRequests.get(requestKey);

  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = getMessages(after, limit)
    .then((messages) => sortMessagesAscending(messages.map(normalizeMessage)))
    .finally(() => {
      inFlightMessageRequests.delete(requestKey);
    });

  inFlightMessageRequests.set(requestKey, request);

  return request;
}

export async function createChatMessage(
  author: string,
  message: string,
  signal?: AbortSignal,
): Promise<Message> {
  const createdMessage = await sendMessage(author, message, signal);

  return normalizeMessage(createdMessage);
}
