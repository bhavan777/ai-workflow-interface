# AI Workflow Interface Server

A Node.js server that provides AI-powered data pipeline configuration through conversational interfaces.

## Overview

The server acts as an intelligent assistant that helps users build data pipelines by asking structured questions and maintaining workflow state. It uses Groq Cloud AI to process conversations and generate workflow configurations.

## Core Behavior

### 1. Conversation Management

- **Stores conversations** in JSON files (development) or in-memory (production)
- **Clears conversations** on server startup for a clean slate
- **Maintains conversation history** to avoid asking the same questions twice
- **Handles conversation persistence** with automatic fallback to in-memory storage

### 2. AI-Powered Workflow Configuration

- **Creates rigid 3-node workflows**: Source → Transform → Destination
- **Asks predefined questions** in a fixed order for each node
- **Accepts any user input** without validation (assumes all input is correct)
- **Maintains workflow state** across conversation turns
- **Completes nodes sequentially** before moving to the next

### 3. Rigid Question Script

The AI follows a **fixed script** for every workflow:

#### Source Node (3 questions, always in this order):

1. "What's your source account name or service identifier? For example: mycompany or myaccount"
2. "What's your source username or access key? For example: user@company.com or access_key_123"
3. "What's your source password or secret key? For example: mypassword123 or sk_live_1234567890abcdef"

#### Transform Node (3 questions, always in this order):

1. "What type of data transformation do you need? For example: filter, aggregate, or map"
2. "What are the transformation parameters? For example: field_name, condition, or mapping_rules"
3. "What is the output format? For example: json, csv, or structured_data"

#### Destination Node (3 questions, always in this order):

1. "What's your destination account name or service identifier? For example: mywarehouse or mydatabase"
2. "What's your destination username or access key? For example: admin@company.com or db_user"
3. "What's your destination password or connection string? For example: mypassword123 or postgresql://user:pass@host:port/db"

### 4. Node Configuration Structure

Each node has a **fixed structure**:

```json
{
  "id": "source-node|transform-node|destination-node",
  "type": "source|transform|destination",
  "name": "Data Source|Data Transform|Data Destination",
  "status": "pending|partial|complete",
  "config": {},
  "data_requirements": {
    "required_fields": ["field1", "field2", "field3"],
    "provided_fields": [],
    "missing_fields": ["field1", "field2", "field3"]
  }
}
```

## Key Requirements

### 1. Rigid Configuration

- ✅ **Fixed node structure** - Never changes based on user input
- ✅ **Fixed question script** - Same questions for every workflow
- ✅ **Fixed field requirements** - Same fields for each node type
- ✅ **No dynamic customization** - AI doesn't adapt questions to specific services

### 2. No Validation

- ✅ **Accepts all input** - Never rejects or questions user input
- ✅ **No format checking** - Doesn't validate URLs, API keys, etc.
- ✅ **No real-world verification** - Doesn't check if credentials actually exist
- ✅ **Assumes correctness** - Treats all input as valid data

### 3. Sequential Processing

- ✅ **Source → Transform → Destination** - Always in this order
- ✅ **Complete one node at a time** - Never asks questions for multiple nodes simultaneously
- ✅ **Move to next only when complete** - All fields must be provided before progression

### 4. State Persistence

- ✅ **Maintains workflow state** - Preserves configuration across messages
- ✅ **Updates incrementally** - Only changes fields that are being updated
- ✅ **Preserves existing data** - Never recreates nodes from scratch

### 5. Conversation Flow

- ✅ **One question at a time** - Never asks multiple questions simultaneously
- ✅ **Clear examples** - Every question includes "For example:" guidance
- ✅ **Thank user** - Acknowledges each piece of information provided
- ✅ **Track progress** - Updates node status based on provided information

## Technical Implementation

### AI Service (`aiService.ts`)

- **Groq Cloud integration** with automatic model fallback
- **JSON response parsing** with error recovery and retry logic
- **Conversation history management** with file-based persistence
- **Workflow state tracking** with node configuration updates

### WebSocket Handler (`websocket.ts`)

- **Real-time communication** with frontend
- **Message routing** between client and AI service
- **Thought broadcasting** for user feedback during processing
- **Error handling** with graceful degradation

### Server Configuration

- **Environment variables** for API keys and configuration
- **CORS handling** for cross-origin requests
- **Security middleware** for request validation
- **Graceful shutdown** handling

## API Endpoints

### WebSocket (`/ws`)

- **Real-time bidirectional communication**
- **Message format**: `{ type: 'message', content: string }`
- **Response format**: `{ type: 'message', content: string, nodes?: [], connections?: [] }`

### Health Check (`/api/hello`)

- **Simple health endpoint** for monitoring
- **Returns**: `{ message: "Hello from AI Workflow Server!" }`

## Environment Variables

```bash
GROQ_API_KEY=gsk_...          # Required: Groq Cloud API key
PORT=3001                     # Optional: Server port (default: 3001)
NODE_ENV=production          # Optional: Environment mode
```

## Error Handling

### AI Service Errors

- **API key validation** on startup
- **Model fallback** when primary model fails
- **JSON parsing recovery** with retry logic
- **Graceful degradation** when AI service is unavailable

### Conversation Errors

- **File system fallback** to in-memory storage
- **Conversation clearing** on startup for clean state
- **Error messages** returned to client for user feedback

## Deployment

### Railway Deployment

- **Automatic deployment** on push to main branch
- **Environment variable configuration** through Railway dashboard
- **Health check monitoring** for service availability

### Local Development

```bash
npm install
npm run dev          # Development with hot reload
npm start           # Production mode
```

## Monitoring and Logging

- **Console logging** for debugging and monitoring
- **Error tracking** with detailed error messages
- **Performance monitoring** for AI response times
- **Conversation tracking** for debugging user flows

## Security Considerations

- **No input validation** - Accepts all user input as-is
- **No credential verification** - Doesn't test provided credentials
- **Environment variable protection** - API keys stored securely
- **CORS configuration** - Controlled cross-origin access

## Performance Characteristics

- **AI response time**: 1-10 seconds depending on model
- **WebSocket latency**: Near real-time communication
- **Memory usage**: Minimal for conversation storage
- **Scalability**: Stateless design allows horizontal scaling

This server is designed to be **predictable, consistent, and user-friendly** while maintaining a rigid structure that ensures all workflows follow the same configuration pattern.
