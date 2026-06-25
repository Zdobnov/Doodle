import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../types/message';

type MessageListProps = {
  messages: Message[];
  statusText?: string;
};

export const MessageList = ({ messages, statusText }: MessageListProps) => {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const content = contentRef.current;

    if (!scrollContainer || !content) {
      return;
    }

    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: content.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages]);

  return (
    <section
      className="message-list"
      ref={scrollContainerRef}
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div className="message-list__inner" ref={contentRef}>
        {statusText && <p className="message-list__status">{statusText}</p>}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </section>
  );
};
