import { WebSocket } from 'ws';
import {
  generateFlowFromDescription,
  getConversationHistory,
  updateFlowWithAnswer,
} from './services/aiService';

// Helper function for adding delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface WorkflowMessage {
  type:
    | 'conversation_start'
    | 'conversation_continue'
    | 'conversation_load'
    | 'error'
    | 'status'
    | 'thought';
  id: string;
  data?: any;
  error?: string;
}

// Helper function to send thought events to client
const sendThought = (ws: WebSocket, messageId: string, thought: string) => {
  ws.send(
    JSON.stringify({
      type: 'thought',
      id: messageId,
      data: {
        message: thought,
        timestamp: new Date().toISOString(),
      },
    })
  );
};

export const handleWebSocketConnection = (ws: WebSocket) => {
  console.log('🔌 New WebSocket connection established');

  ws.on('message', async (message: string) => {
    try {
      const parsedMessage: WorkflowMessage = JSON.parse(message);

      switch (parsedMessage.type) {
        case 'conversation_start':
          await handleConversationStart(ws, parsedMessage);
          break;
        case 'conversation_continue':
          await handleConversationContinue(ws, parsedMessage);
          break;
        case 'conversation_load':
          await handleConversationLoad(ws, parsedMessage);
          break;
        default:
          ws.send(
            JSON.stringify({
              type: 'error',
              id: parsedMessage.id,
              error: 'Unknown message type',
            })
          );
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(
        JSON.stringify({
          type: 'error',
          id: 'unknown',
          error: 'Invalid message format',
        })
      );
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
};

const handleConversationLoad = async (
  ws: WebSocket,
  message: WorkflowMessage
) => {
  try {
    console.log('📂 Loading conversation:', message.id);

    const { conversationId } = message.data;
    const conversationHistory = getConversationHistory(conversationId);

    if (!conversationHistory) {
      ws.send(
        JSON.stringify({
          type: 'error',
          id: message.id,
          error: 'Conversation not found',
        })
      );
      return;
    }

    // Find the last assistant message to get the current workflow state
    const lastAssistantMessage = conversationHistory
      .filter((msg: { role: string }) => msg.role === 'assistant')
      .pop();

    if (lastAssistantMessage) {
      try {
        const workflowData = JSON.parse(lastAssistantMessage.content);
        ws.send(
          JSON.stringify({
            type: 'conversation_load',
            id: message.id,
            data: {
              conversationId,
              messages: conversationHistory,
              workflow: workflowData,
            },
          })
        );
      } catch (error) {
        console.error('Error parsing workflow data:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            id: message.id,
            error: 'Invalid conversation data',
          })
        );
      }
    } else {
      ws.send(
        JSON.stringify({
          type: 'error',
          id: message.id,
          error: 'No workflow data found in conversation',
        })
      );
    }
  } catch (error) {
    console.error('❌ Error loading conversation:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        id: message.id,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    );
  }
};

const handleConversationStart = async (
  ws: WebSocket,
  message: WorkflowMessage
) => {
  try {
    console.log('🚀 Starting conversation:', message.id);
    console.log('📝 Description:', message.data.description);

    // Send status update
    ws.send(
      JSON.stringify({
        type: 'status',
        id: message.id,
        data: { status: 'processing' },
      })
    );

    // Add initial delay before first thought
    await delay(500);
    sendThought(ws, message.id, '🤔 Analyzing your workflow requirements...');

    const { description } = message.data;
    const result = await generateFlowFromDescription(
      description,
      message.id,
      async thought => {
        // Add delay before each thought for more natural feel
        await delay(300);
        sendThought(ws, message.id, thought);
      }
    );

    console.log('✅ Conversation result:', JSON.stringify(result, null, 2));

    // Add final delay before sending result
    await delay(800);

    // Send the result with conversation ID
    ws.send(
      JSON.stringify({
        type: 'conversation_start',
        id: message.id,
        data: {
          ...result,
          conversationId: message.id,
        },
      })
    );

    console.log('📤 Sent conversation result to client');
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        id: message.id,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    );
  }
};

const handleConversationContinue = async (
  ws: WebSocket,
  message: WorkflowMessage
) => {
  try {
    // Send status update
    ws.send(
      JSON.stringify({
        type: 'status',
        id: message.id,
        data: { status: 'processing' },
      })
    );

    // Add delay before processing thought
    await delay(400);
    sendThought(ws, message.id, '🔄 Processing your response...');

    const { conversationId, answer } = message.data;
    const result = await updateFlowWithAnswer(
      conversationId,
      answer,
      async thought => {
        // Add delay before each thought
        await delay(250);
        sendThought(ws, message.id, thought);
      }
    );

    // Add delay before sending final result
    await delay(600);

    // Send the result
    ws.send(
      JSON.stringify({
        type: 'conversation_continue',
        id: message.id,
        data: result,
      })
    );
  } catch (error) {
    console.error('Error continuing conversation:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        id: message.id,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    );
  }
};
