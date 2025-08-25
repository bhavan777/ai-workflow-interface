import { WebSocket } from 'ws';
import { processMessage } from './services/aiService';

// Helper function for adding delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export interface Message {
  id: string; // Unique message ID
  response_to?: string; // ID of message this responds to (for conversation threading)
  role: 'user' | 'assistant'; // Who sent the message
  type: 'MESSAGE' | 'THOUGHT' | 'ERROR' | 'STATUS' | 'GET_NODE_DATA';
  content: string; // Main message content (or thought content)
  timestamp: string; // ISO timestamp
  message_type?: 'text' | 'markdown'; // Type of message content

  // For assistant MESSAGE responses - only include if workflow state changed
  nodes?: DataFlowNode[];
  connections?: DataFlowConnection[];
  workflow_complete?: boolean; // Indicates if the workflow configuration is complete

  // For status updates
  status?: 'processing' | 'complete' | 'error';

  // For GET_NODE_DATA events
  node_id?: string;
}

export interface DataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: Record<string, any>;
  position?: { x: number; y: number };
  data_requirements?: {
    required_fields: string[];
    provided_fields: string[];
    missing_fields: string[];
  };
}

export interface DataFlowConnection {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'complete' | 'error';
}

// Store conversation history for each WebSocket connection (in-memory only)
const conversationHistories = new WeakMap<WebSocket, Message[]>();

export const handleWebSocketConnection = (ws: WebSocket) => {
  console.log('🔌 New WebSocket connection established');

  ws.on('message', async (message: string) => {
    try {
      const parsedMessage: Message = JSON.parse(message);

      // All messages go through the same handler
      await handleMessage(ws, parsedMessage);
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(
        JSON.stringify({
          id: generateId(),
          role: 'assistant',
          type: 'ERROR',
          content: 'Invalid message format',
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    // Clean up conversation history when connection closes
    conversationHistories.delete(ws);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
};

const handleMessage = async (ws: WebSocket, message: Message) => {
  try {
    console.log(
      '🔍 Processing message type:',
      message.type,
      'with content:',
      message.content
    );

    // Handle GET_NODE_DATA event
    if (message.type === 'GET_NODE_DATA') {
      console.log(
        '📊 Handling GET_NODE_DATA request for node:',
        message.node_id
      );
      await handleGetNodeData(ws, message);
      return;
    }

    // Get or create conversation history for this WebSocket connection
    let conversationHistory = conversationHistories.get(ws) || [];

    // Send processing status
    ws.send(
      JSON.stringify({
        id: generateId(),
        role: 'assistant',
        type: 'STATUS',
        content: 'Processing your message...',
        status: 'processing',
        timestamp: new Date().toISOString(),
      })
    );

    // Add initial delay before first thought
    await delay(500);

    // Send thought before processing
    ws.send(
      JSON.stringify({
        id: generateId(),
        role: 'assistant',
        type: 'THOUGHT',
        content: '🔍 Analyzing your workflow requirements...',
        timestamp: new Date().toISOString(),
      })
    );

    // If this is a new workflow request, clear history
    const isNewWorkflow =
      conversationHistory.length === 0 ||
      message.content.toLowerCase().includes('shopify') ||
      message.content.toLowerCase().includes('snowflake') ||
      message.content.toLowerCase().includes('connect') ||
      message.content.toLowerCase().includes('pipeline') ||
      message.content.toLowerCase().includes('workflow');

    if (isNewWorkflow && conversationHistory.length > 0) {
      console.log('🔄 Starting new workflow - clearing conversation history');
      conversationHistory = [];
    }

    console.log(
      `📚 Using conversation history (${conversationHistory.length} messages)`
    );

    // Process the message with multi-model approach
    const filteredHistory = conversationHistory.filter(
      msg => msg.type !== 'GET_NODE_DATA'
    ) as any[];
    const response = await processMessage(
      filteredHistory,
      { ...message, type: 'MESSAGE' as const },
      async (thought: string) => {
        // Send additional thoughts during processing
        ws.send(
          JSON.stringify({
            id: generateId(),
            role: 'assistant',
            type: 'THOUGHT',
            content: thought,
            timestamp: new Date().toISOString(),
          })
        );
      }
    );

    // Update conversation history in memory
    const updatedConversation = [...conversationHistory, message, response];
    conversationHistories.set(ws, updatedConversation);
    console.log(
      `💾 Updated conversation history (${updatedConversation.length} messages)`
    );

    // Add final delay before sending result
    await delay(800);

    // Send the response
    ws.send(JSON.stringify(response));

    // Clear thoughts after processing is complete
    await delay(100);
    ws.send(
      JSON.stringify({
        id: generateId(),
        role: 'assistant',
        type: 'THOUGHT',
        content: '', // Empty content to clear thoughts
        timestamp: new Date().toISOString(),
      })
    );

    // Log the workflow state being sent
    if (response.nodes && response.connections) {
      console.log('📊 Sent workflow state to client:');
      console.log(`  - Nodes: ${response.nodes.length} nodes`);
      console.log(
        `  - Connections: ${response.connections.length} connections`
      );
      console.log(
        `  - Workflow complete: ${response.workflow_complete || false}`
      );
    }

    console.log('📤 Sent response to client');
  } catch (error) {
    console.error('❌ Error handling message:', error);
    ws.send(
      JSON.stringify({
        id: generateId(),
        role: 'assistant',
        type: 'ERROR',
        content:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      })
    );
  }
};

const handleGetNodeData = async (ws: WebSocket, message: Message) => {
  try {
    console.log('🔧 handleGetNodeData called with node_id:', message.node_id);
    const nodeId = message.node_id;
    if (!nodeId) {
      ws.send(
        JSON.stringify({
          id: generateId(),
          role: 'assistant',
          type: 'ERROR',
          content: 'Node ID is required',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Get conversation history to find the node data
    const conversationHistory = conversationHistories.get(ws) || [];

    // Find the latest workflow state
    const latestWorkflowMessage = conversationHistory
      .filter(msg => msg.nodes && msg.connections)
      .pop();

    if (!latestWorkflowMessage || !latestWorkflowMessage.nodes) {
      ws.send(
        JSON.stringify({
          id: generateId(),
          role: 'assistant',
          type: 'ERROR',
          content: 'No workflow data available',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Find the specific node
    const node = latestWorkflowMessage.nodes.find(n => n.id === nodeId);
    if (!node) {
      ws.send(
        JSON.stringify({
          id: generateId(),
          role: 'assistant',
          type: 'ERROR',
          content: 'Node not found',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Extract filled values from the node's data requirements
    const filledValues: Record<string, string> = {};

    if (node.data_requirements?.required_fields) {
      node.data_requirements.required_fields.forEach(field => {
        const isProvided =
          node.data_requirements?.provided_fields.includes(field);
        filledValues[field] = isProvided
          ? node.config?.[field] || 'Filled'
          : 'Not filled';
      });
    }

    // Send the node data response
    ws.send(
      JSON.stringify({
        id: generateId(),
        role: 'assistant',
        type: 'NODE_DATA',
        node_id: nodeId,
        node_title: node.name,
        filled_values: filledValues,
        timestamp: new Date().toISOString(),
      })
    );

    console.log(`📊 Sent node data for node: ${node.name}`);
  } catch (error) {
    console.error('❌ Error handling GET_NODE_DATA:', error);
    ws.send(
      JSON.stringify({
        id: generateId(),
        role: 'assistant',
        type: 'ERROR',
        content: 'Failed to get node data',
        timestamp: new Date().toISOString(),
      })
    );
  }
};
