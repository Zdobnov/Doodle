import { getMessages, sendMessage } from '../api/messages';
import type { Message } from '../types/message';
import { normalizeMessage, sortMessagesAscending } from '../utils/message';

export async function fetchChatMessages(
  after?: string,
  limit?: number,
): Promise<Message[]> {
  const messages = await getMessages(after, limit);

  return sortMessagesAscending(messages.map(normalizeMessage));
}

export async function createChatMessage(
  author: string,
  message: string,
): Promise<Message> {
  const createdMessage = await sendMessage(author, message);

  return normalizeMessage(createdMessage);
}
