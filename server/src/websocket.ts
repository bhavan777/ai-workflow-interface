import { WebSocket } from 'ws';
import { 
  generateFlowFromDescription, 
  updateFlowWithAnswer,
  ConversationMessage 
} from './services/aiService';

export interface WorkflowMessage {
  type: 'conversation_start' | 'conversation_continue' | 'error' | 'status';
  id: string;
  data?: any;
  error?: string;
}

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
        default:
          ws.send(JSON.stringify({
            type: 'error',
            id: parsedMessage.id,
            error: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        id: 'unknown',
        error: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};



const handleConversationStart = async (ws: WebSocket, message: WorkflowMessage) => {
  try {
    // Send status update
    ws.send(JSON.stringify({
      type: 'status',
      id: message.id,
      data: { status: 'processing' }
    }));

    const { description } = message.data;
    const result = await generateFlowFromDescription(description, message.id);

    // Send the result
    ws.send(JSON.stringify({
      type: 'conversation_start',
      id: message.id,
      data: result
    }));
  } catch (error) {
    console.error('Error starting conversation:', error);
    ws.send(JSON.stringify({
      type: 'error',
      id: message.id,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }));
  }
};

const handleConversationContinue = async (ws: WebSocket, message: WorkflowMessage) => {
  try {
    // Send status update
    ws.send(JSON.stringify({
      type: 'status',
      id: message.id,
      data: { status: 'processing' }
    }));

    const { conversationId, answer } = message.data;
    const result = await updateFlowWithAnswer(conversationId, answer);

    // Send the result
    ws.send(JSON.stringify({
      type: 'conversation_continue',
      id: message.id,
      data: result
    }));
  } catch (error) {
    console.error('Error continuing conversation:', error);
    ws.send(JSON.stringify({
      type: 'error',
      id: message.id,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }));
  }
};
