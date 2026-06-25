import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CURRENT_AUTHOR,
  MESSAGE_PAGE_SIZE,
  MESSAGE_REFRESH_INTERVAL_MS,
} from '../constants/chat';
import {
  createChatMessage,
  fetchChatMessages,
} from '../services/chatService';
import type { Message } from '../types/message';
import {
  getLatestMessageCursor,
  mergeMessages,
} from '../utils/message';

type ChatStatus = 'idle' | 'loading' | 'ready' | 'submitting' | 'error';

type UseChatMessagesResult = {
  messages: Message[];
  status: ChatStatus;
  error: string | null;
  submitMessage: (message: string) => Promise<void>;
};

function getLaterTimestamp(first?: string, second?: string): string | undefined {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return Date.parse(first) > Date.parse(second) ? first : second;
}

export function useChatMessages(): UseChatMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);
  const pollCursorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    async function loadMessages() {
      setStatus('loading');

      try {
        const remoteMessages = await fetchChatMessages(
          undefined,
          MESSAGE_PAGE_SIZE,
        );

        if (!isActive) {
          return;
        }

        setMessages(remoteMessages);
        pollCursorRef.current =
          getLatestMessageCursor(remoteMessages) ?? new Date().toISOString();
        setError(null);
        setStatus('ready');
      } catch (cause) {
        if (!isActive) {
          return;
        }

        setError(cause instanceof Error ? cause.message : 'Unable to load chat');
        setStatus('error');
      }
    }

    void loadMessages();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (isRefreshingRef.current) {
        return;
      }

      isRefreshingRef.current = true;

      const refreshStartedAt = new Date().toISOString();

      void fetchChatMessages(pollCursorRef.current, MESSAGE_PAGE_SIZE)
        .then((newMessages) => {
          pollCursorRef.current = getLaterTimestamp(
            getLatestMessageCursor(newMessages),
            refreshStartedAt,
          );

          if (newMessages.length > 0) {
            setMessages((latestMessages) =>
              mergeMessages(latestMessages, newMessages),
            );
          }

          setError(null);
          setStatus((currentStatus) =>
            currentStatus === 'submitting' ? currentStatus : 'ready',
          );
        })
        .catch((cause) => {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Unable to refresh messages',
          );
        })
        .finally(() => {
          isRefreshingRef.current = false;
        });
    }, MESSAGE_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const submitMessage = useCallback(async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const optimisticMessage: Message = {
      id: `local-${Date.now()}`,
      author: CURRENT_AUTHOR,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    setMessages((currentMessages) =>
      mergeMessages(currentMessages, [optimisticMessage]),
    );
    setStatus('submitting');

    try {
      const createdMessage = await createChatMessage(
        CURRENT_AUTHOR,
        trimmedMessage,
      );

      pollCursorRef.current = getLaterTimestamp(
        pollCursorRef.current,
        createdMessage.cursorCreatedAt,
      );

      setMessages((currentMessages) =>
        mergeMessages(
          currentMessages.map((item) =>
            item.id === optimisticMessage.id ? createdMessage : item,
          ),
          [],
        ),
      );
      setError(null);
      setStatus('ready');
    } catch (cause) {
      setMessages((currentMessages) =>
        currentMessages.filter((item) => item.id !== optimisticMessage.id),
      );
      setError(cause instanceof Error ? cause.message : 'Unable to send message');
      setStatus('error');
    }
  }, []);

  return useMemo(
    () => ({
      messages,
      status,
      error,
      submitMessage,
    }),
    [error, messages, status, submitMessage],
  );
}
