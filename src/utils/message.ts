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

export function getMessageCursor(message: Message): string | undefined {
  return message.cursorCreatedAt;
}

export function getLatestMessageCursor(messages: Message[]): string | undefined {
  return [...messages].reverse().find((message) => message.cursorCreatedAt)
    ?.cursorCreatedAt;
}

export function sortMessagesAscending(messages: Message[]): Message[] {
  return [...messages].sort(
    (first, second) =>
      (Date.parse(getMessageDate(first)) || 0) -
      (Date.parse(getMessageDate(second)) || 0),
  );
}

export function formatMessageDate(value: string): string {
  return dateFormatter.format(new Date(value)).replace(',', '');
}

export function normalizeMessage(rawMessage: ApiMessage, index = 0): Message {
  const cursorCreatedAt =
    rawMessage.createdAt ??
    rawMessage.created_at ??
    rawMessage.timestamp ??
    rawMessage.date;
  const createdAt = cursorCreatedAt ?? '';
  const message = rawMessage.message ?? '';
  const author = rawMessage.author ?? 'Unknown';
  const id = rawMessage.id ?? `${author}-${createdAt}-${message}-${index}`;

  return {
    id: String(id),
    author,
    message,
    createdAt,
    cursorCreatedAt,
  };
}

export function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const messagesById = new Map<string, Message>();

  for (const message of [...current, ...incoming]) {
    messagesById.set(message.id, message);
  }

  return sortMessagesAscending([...messagesById.values()]);
}
