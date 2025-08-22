# AI Workflow Interface - Server

A Node.js/TypeScript server that provides AI-powered data flow conversation capabilities with WebSocket support for real-time communication.

## Features

- **Groq Cloud AI Integration**: Uses Groq Cloud's unlimited access to LLaMA-2 70B, Mixtral-8x7B, and Gemma 7B models
- **Intelligent Model Selection**: Automatically chooses the best model for each task
- **WebSocket Support**: Real-time communication for interactive chat interface
- **REST API**: HTTP endpoints for data flow processing
- **TypeScript**: Full type safety and modern development experience
- **Hot Reload**: Development server with automatic restart on file changes

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment Configuration**:
   - Copy `env.example` to `.env`
   - Add your Groq Cloud API key (free at https://console.groq.com/):
     ```
     GROQ_API_KEY=gsk-your-groq-cloud-api-key-here
     PORT=3001
     NODE_ENV=development
     ```

3. **Development**:

   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## Testing

Run the integration test to verify Groq Cloud is working:

```bash
npm test
```

## Intelligent Model Selection

The system automatically selects the optimal model for each task:

- **Gemma 7B**: Used for simple, fast tasks (quick responses, basic questions)
- **Mixtral 8x7B**: Used for balanced performance (most workflows)
- **LLaMA-2 70B**: Used for complex tasks (detailed integrations, multiple requirements)

## API Endpoints

### REST API

- `GET /health` - Health check
- `GET /api/ai/workflows` - Get available workflow templates
- `POST /api/ai/conversation/start` - Start a new data flow conversation
- `POST /api/ai/conversation/continue` - Continue an existing conversation

### WebSocket Events

- `conversation_start` - Start a new data flow conversation
- `conversation_continue` - Continue an existing conversation
- `status` - Status updates during processing
- `error` - Error responses

## Data Flow Conversation

The server is designed to handle conversations about data flows. When a user describes a data flow (e.g., "Connect Shopify to Snowflake"), the AI will:

1. Understand the requirements
2. Ask clarifying questions
3. Generate structured data flow diagrams
4. Provide configuration suggestions

### Example Usage

**Starting a conversation**:

```javascript
// WebSocket
ws.send(JSON.stringify({
  type: 'conversation_start',
  id: 'msg-1',
  data: {
    description: 'Connect Shopify to Snowflake'
  }
}));

// REST API
POST /api/ai/conversation/start
{
  "description": "Connect Shopify to Snowflake"
}
```

**Continuing a conversation**:

```javascript
// WebSocket
ws.send(JSON.stringify({
  type: 'conversation_continue',
  id: 'msg-2',
  data: {
    conversationHistory: [...],
    answer: 'My store URL is example.myshopify.com'
  }
}));

// REST API
POST /api/ai/conversation/continue
{
  "conversationHistory": [...],
  "answer": "My store URL is example.myshopify.com"
}
```

## Response Format

The AI responses include structured data for rendering flow diagrams:

```typescript
interface DataFlowResponse {
  message: string; // Human-readable message
  nodes: DataFlowNode[]; // Flow diagram nodes
  connections: DataFlowConnection[]; // Connections between nodes
  questions?: string[]; // Follow-up questions
  isComplete: boolean; // Whether the flow is complete
}
```

## Node Types

- **source**: Databases, APIs, file systems (blue)
- **transform**: Data processing, filtering, mapping (purple)
- **destination**: Warehouses, APIs, applications (green)

## Node Status

- **pending**: Initial state (orange)
- **partial**: Some configuration provided (blue)
- **complete**: Fully configured (green)
- **error**: Configuration issues (red)

## Why Groq Cloud?

- **🆓 Completely Free**: Unlimited access to multiple models
- **⚡ Ultra-Fast**: Specialized inference hardware
- **🎯 Smart Model Selection**: Automatically picks the best model for each task
- **🔄 No Quotas**: No rate limiting headaches
- **💪 Production Ready**: Great for development and demos
- **🚀 Beta Access**: Cutting-edge models and features

## Development

The server uses:

- **TypeScript** for type safety
- **Express** for HTTP server
- **ws** for WebSocket support
- **Groq Cloud** for AI conversations
- **nodemon** for development hot reload

## Deployment

For production deployment, consider:

- Using a process manager like PM2
- Setting up proper environment variables
- Implementing rate limiting
- Adding authentication/authorization
- Setting up monitoring and logging
