# Redux Store Setup

This directory contains the Redux store configuration for managing chat messages and workflow data.

## Structure

```
store/
├── index.ts          # Main store configuration
├── hooks.ts          # Typed Redux hooks
├── types.ts          # Store-specific type definitions
├── slices/
│   └── chatSlice.ts  # Chat messages and workflow state
└── README.md         # This file
```

## Store Configuration

The main store (`index.ts`) contains one slice:

- **chat**: Manages chat messages, conversation state, workflow nodes, connections, and questions

## Chat Slice

### State Structure

```typescript
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  // Current workflow state (from latest assistant message)
  currentNodes: DataFlowNode[];
  currentConnections: DataFlowConnection[];
  currentQuestions: Question[];
  isWorkflowComplete: boolean;
}
```

### Message Structure

Message structure is defined in `@/store/types`:

```typescript
import type { Message } from '@/store/types';
```

See `src/store/types.ts` for the complete type definition.

### Workflow Data Structures

Workflow data structures are now defined in `@/types` and imported from there:

```typescript
import type { DataFlowNode, DataFlowConnection, Question } from '@/types';
```

See `src/types/workflow.ts` for the complete type definitions.

### Actions

- `addMessage`: Add a new message to the conversation
- `updateMessageStatus`: Update message status (sending/sent/error)
- `clearMessages`: Clear all messages and reset conversation
- `setConversationId`: Set the current conversation ID
- `setError`: Set error state
- `updateCurrentWorkflow`: Update current workflow state

**Note**: Conversation management is now handled via WebSocket in the `useChat` hook, not through Redux async thunks.

### Usage

```typescript
import { useChat } from '@/hooks/useChat';

const {
  messages,
  currentNodes,
  currentQuestions,
  startNewConversation,
  continueExistingConversation,
} = useChat();
```

## Custom Hooks

### useChat()

Provides a clean interface for chat and workflow functionality:

- `messages`: Array of chat messages
- `isLoading`: Loading state for API calls
- `error`: Error state
- `conversationId`: Current conversation ID
- `currentNodes`: Current workflow nodes
- `currentConnections`: Current workflow connections
- `currentQuestions`: Current questions to answer
- `isWorkflowComplete`: Whether the workflow is complete
- `startNewConversation(description)`: Start a new conversation
- `continueExistingConversation(answer)`: Continue with an answer
- `addUserMessage(content)`: Add a user message
- `clearConversation()`: Clear the current conversation
- `setConversation(id)`: Set conversation ID

## API Integration

The store is designed to work with the backend API endpoints:

- `POST /api/conversation/start`: Start a new conversation
- `POST /api/conversation/continue`: Continue an existing conversation

## Workflow State Management

The workflow state is managed as part of the chat conversation:

- Nodes, connections, and questions are stored in assistant messages
- The current workflow state is extracted from the latest assistant message
- Each conversation response updates the workflow state
- Questions guide the user through workflow configuration

## TypeScript Support

The store includes full TypeScript support with:

- Typed state interfaces
- Typed action creators
- Typed custom hooks
- Type-safe dispatch and selector functions

## Middleware Configuration

The store includes custom middleware configuration to handle:

- Serialization checks for Date objects
- Async action handling
- Error handling for API calls
