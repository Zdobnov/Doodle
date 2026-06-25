import type { ApiMessage, Message } from '../types/message';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function getMessageDate(message: Message): string {
  return message.createdAt;
}

export function sortMessagesAscending(messages: Message[]): Message[] {
  return [...messages].sort(
    (first, second) =>
      new Date(getMessageDate(first)).getTime() -
      new Date(getMessageDate(second)).getTime(),
  );
}

export function formatMessageDate(value: string): string {
  return dateFormatter.format(new Date(value)).replace(',', '');
}

export function normalizeMessage(rawMessage: ApiMessage, index = 0): Message {
  const createdAt =
    rawMessage.createdAt ??
    rawMessage.created_at ??
    rawMessage.timestamp ??
    rawMessage.date ??
    new Date().toISOString();
  const message = rawMessage.message ?? '';
  const author = rawMessage.author ?? 'Unknown';
  const id = rawMessage.id ?? `${author}-${createdAt}-${message}-${index}`;

  return {
    id: String(id),
    author,
    message,
    createdAt,
  };
}

export function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const messagesById = new Map<string, Message>();

  for (const message of [...current, ...incoming]) {
    messagesById.set(message.id, message);
  }

  return sortMessagesAscending([...messagesById.values()]);
}
