import { generateFlowFromDescription, updateFlowWithAnswer } from '../lib/groq';

// Helper function for adding delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface WorkflowMessage {
  type:
    | 'conversation_start'
    | 'conversation_continue'
    | 'error'
    | 'status'
    | 'thought';
  id: string;
  data?: any;
  error?: string;
}

// Helper function to send thought events to client
const sendThought = (ws: any, messageId: string, thought: string) => {
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

const handleConversationStart = async (ws: any, message: WorkflowMessage) => {
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
  ws: any,
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

// Vercel WebSocket handler
export default function handler(req: any, res: any) {
  // Check if this is a WebSocket upgrade request
  if (req.headers.upgrade === 'websocket') {
    // For now, return a response indicating WebSocket is ready
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'WebSocket endpoint ready for upgrade',
        status: 'ready',
        note: 'WebSocket upgrade will be implemented next',
      })
    );
  } else {
    // Return a simple response for non-WebSocket requests
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'WebSocket endpoint - use WebSocket connection',
        note: 'This endpoint expects WebSocket upgrade requests',
      })
    );
  }
}
