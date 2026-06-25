import { ChatComposer, MessageList } from '../components/chat';
import { useChatMessages } from '../hooks';

export const HomePage = () => {
  const { messages, status, error, submitMessage } = useChatMessages();
  const isLoading = status === 'loading';
  const isSubmitting = status === 'submitting';
  const statusText = isLoading
    ? 'Loading messages...'
    : error
      ? error
      : messages.length === 0
        ? 'No messages yet'
        : undefined;

  return (
    <main className="chat-page">
      <MessageList messages={messages} statusText={statusText} />
      <ChatComposer disabled={isLoading || isSubmitting} onSend={submitMessage} />
    </main>
  );
};
