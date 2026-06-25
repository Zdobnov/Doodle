# Doodle

React + TypeScript + Vite chat frontend.

## Scripts

```bash
npm install
npm run dev
```

The frontend expects the chat API to be available at `http://localhost:3000`.
During local development Vite proxies `/api` requests to that backend.

## Possible Improvements

- Decode escaped HTML entities in message text, for example `&#39;`, before
  rendering user-visible content.
- Move repeated colors, spacing, and sizing values into CSS variables.
- Add React Query for request caching, retries, mutation state, and cleaner
  server-state management.
- Add message-list virtualization if the API is expected to return or paginate
  through a large number of messages.
- Continue improving accessibility, including richer status announcements,
  keyboard flow, and focus management around sending and loading states.
- Replace polling with WebSockets or another realtime transport for production
  chat behavior.
