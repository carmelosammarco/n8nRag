# Chat Interface

A modern and beautiful chat interface that sends messages to a webhook and displays responses.

## Features

- 🎨 Modern, gradient-based UI design
- 💬 Real-time message sending and receiving
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- 📱 Responsive design for mobile and desktop
- ✨ Smooth animations and transitions
- 🔄 Typing indicator while waiting for response
- 🎯 Auto-scrolling to latest messages
- ⚠️ Error handling and display

## Usage

### Option 1: Using Python (Recommended)

```bash
python3 server.py
```

Then open http://localhost:8000 in your browser.

### Option 2: Using Node.js

```bash
npx http-server -p 8000 --cors
```

Then open http://localhost:8000 in your browser.

### Option 3: Direct file open (May have CORS issues)

Open `index.html` directly in your browser. Note: This may not work due to CORS restrictions when making requests to external webhooks.

### Using the Chat

1. Type your message in the input field
2. Press Enter or click the send button
3. Wait for the response from the webhook

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `script.js` - JavaScript functionality and webhook integration

## Webhook Integration

The chat sends POST requests to the configured webhook URL with the following JSON payload:

```json
{
  "message": "user message text",
  "timestamp": "ISO 8601 timestamp"
}
```

The interface expects a response that can be:
- JSON with a `message`, `response`, or `text` field
- Plain text response
- Any other JSON (will be stringified)

