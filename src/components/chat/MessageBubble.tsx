import { CURRENT_AUTHOR } from '../../constants/chat';
import type { Message } from '../../types/message';
import { formatMessageDate, getMessageDate } from '../../utils/message';

type MessageBubbleProps = {
  message: Message;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOwnMessage = message.author === CURRENT_AUTHOR;
  const className = isOwnMessage
    ? 'message-bubble message-bubble--own'
    : 'message-bubble';

  return (
    <article className={className}>
      {!isOwnMessage && <p className="message-bubble__author">{message.author}</p>}
      <p className="message-bubble__text">{message.message}</p>
      {message.createdAt && (
        <time className="message-bubble__time" dateTime={getMessageDate(message)}>
          {formatMessageDate(getMessageDate(message))}
        </time>
      )}
    </article>
  );
};
