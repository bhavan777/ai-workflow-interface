# Vercel Deployment Guide

This guide will help you deploy the server to Vercel as serverless functions.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Groq API Key**: Get your API key from [console.groq.com](https://console.groq.com)
3. **Node.js**: Version 18 or higher

## Quick Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

```bash
cd server
vercel --prod
```

### 4. Set Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `GROQ_API_KEY` = `your_groq_api_key_here`

### 5. Get Your WebSocket URL

After deployment, you'll get a URL like:

```
https://your-app.vercel.app
```

Your WebSocket endpoint will be:

```
wss://your-app.vercel.app/api/websocket
```

## File Structure

```
server/
├── api/
│   └── websocket.ts          # WebSocket handler
├── lib/
│   └── groq.ts              # Groq client logic
├── vercel.json              # Vercel configuration
└── package.json             # Dependencies
```

## Testing Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Test Vercel Setup

```bash
node test-vercel.js
```

### 3. Deploy Locally (Optional)

```bash
vercel dev
```

## Environment Variables

| Variable       | Description       | Required |
| -------------- | ----------------- | -------- |
| `GROQ_API_KEY` | Your Groq API key | Yes      |

## WebSocket Endpoints

- **Production**: `wss://your-app.vercel.app/api/websocket`
- **Development**: `ws://localhost:3001` (when using local server)

## Message Types

The WebSocket supports these message types:

### `conversation_start`

Start a new conversation with a workflow description.

```json
{
  "type": "conversation_start",
  "id": "unique-message-id",
  "data": {
    "description": "Connect my Shopify store to Snowflake"
  }
}
```

### `conversation_continue`

Continue an existing conversation with an answer.

```json
{
  "type": "conversation_continue",
  "id": "unique-message-id",
  "data": {
    "conversationId": "existing-conversation-id",
    "answer": "My database connection string is..."
  }
}
```

## Response Types

### `conversation_start` / `conversation_continue`

```json
{
  "type": "conversation_start",
  "id": "message-id",
  "data": {
    "message": "I've created your workflow...",
    "message_type": "text",
    "nodes": [...],
    "connections": [...],
    "questions": [...],
    "isComplete": false,
    "conversationId": "conv-id"
  }
}
```

### `thought`

```json
{
  "type": "thought",
  "id": "message-id",
  "data": {
    "message": "🤔 Analyzing your requirements...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### `error`

```json
{
  "type": "error",
  "id": "message-id",
  "error": "Error message here"
}
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if the URL is correct
   - Ensure the deployment is successful
   - Verify environment variables are set

2. **Groq API Errors**
   - Verify your API key is correct
   - Check your Groq account balance
   - Ensure the API key has proper permissions

3. **Deployment Issues**
   - Check Vercel logs in the dashboard
   - Verify all dependencies are in package.json
   - Ensure TypeScript compilation succeeds

### Logs

Check Vercel function logs in the dashboard:

1. Go to your project in Vercel dashboard
2. Click on "Functions" tab
3. Click on the function to view logs

## Next Steps

After successful deployment:

1. **Update Client**: Change the WebSocket URL in your client code
2. **Test Connection**: Verify WebSocket connection works
3. **Monitor Usage**: Check Vercel dashboard for usage and performance
4. **Scale**: Vercel automatically scales based on usage

## Cost Considerations

- **Vercel**: Free tier includes 100GB-hours of serverless function execution
- **Groq**: Pay per token usage, check [pricing](https://console.groq.com/pricing)

For a demo, the free tiers should be sufficient.
