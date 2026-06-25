import { useState } from 'react';
import type { FormEvent } from 'react';

type ChatComposerProps = {
  disabled?: boolean;
  onSend: (message: string) => Promise<void>;
};

export const ChatComposer = ({ disabled = false, onSend }: ChatComposerProps) => {
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || disabled) {
      return;
    }

    const messageToSend = message;
    setMessage('');
    await onSend(messageToSend);
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit} aria-label="Send message">
      <div className="chat-composer__inner">
        <label className="sr-only" htmlFor="chat-message">
          Message
        </label>
        <input
          id="chat-message"
          className="chat-composer__input"
          name="message"
          placeholder="Message"
          value={message}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => setMessage(event.target.value)}
        />
        <button className="chat-composer__button" type="submit" disabled={disabled}>
          Send
        </button>
      </div>
    </form>
  );
};
