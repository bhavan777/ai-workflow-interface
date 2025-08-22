import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Lazy initialization of Google AI client
let genAI: GoogleGenerativeAI | null = null;

// File-based conversation store for persistence
const CONVERSATIONS_DIR = path.join(__dirname, '../../conversations');

// Ensure conversations directory exists
if (!fs.existsSync(CONVERSATIONS_DIR)) {
  fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
}

const getConversationPath = (conversationId: string): string => {
  return path.join(CONVERSATIONS_DIR, `${conversationId}.json`);
};

const saveConversation = (conversationId: string, messages: ConversationMessage[]): void => {
  try {
    const filePath = getConversationPath(conversationId);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
};

const loadConversation = (conversationId: string): ConversationMessage[] | null => {
  try {
    const filePath = getConversationPath(conversationId);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load conversation:', error);
  }
  return null;
};

const deleteConversation = (conversationId: string): boolean => {
  try {
    const filePath = getConversationPath(conversationId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
  return false;
};

const getGoogleAIClient = (): GoogleGenerativeAI => {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required. Please set it in your .env file or environment.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: any;
  position?: { x: number; y: number };
}

export interface DataFlowConnection {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'complete' | 'error';
}

export interface Question {
  id: string;
  text: string;
  node_id: string;
  field: string;
  type: 'text' | 'password' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  required?: boolean;
}

export interface DataFlowResponse {
  message: string;
  message_type?: 'text' | 'markdown' | 'code';
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
  questions?: Question[];
  isComplete: boolean;
}

const SYSTEM_PROMPT = `You are a data integration expert helping users build data pipelines. Your role is to:

1. Understand user requirements for data flows
2. Ask clarifying questions to gather necessary details
3. Generate structured data flow diagrams with nodes and connections
4. Provide configuration suggestions for each component

IMPORTANT: Always respond with ONLY a JSON object. Do not include markdown formatting, code blocks, or any other text.

Response format (respond with ONLY this JSON structure):
{
  "message": "I'll help you connect Shopify to Snowflake. I need a few details first...",
  "message_type": "text",
  "nodes": [
    {
      "id": "shopify-1",
      "type": "source",
      "name": "Shopify Store",
      "status": "pending",
      "config": { "type": "shopify", "required_fields": ["store_url", "api_key"] }
    }
  ],
  "connections": [],
  "questions": [
    {
      "id": "q1",
      "text": "What's your Shopify store URL?",
      "node_id": "shopify-1",
      "field": "store_url",
      "type": "text",
      "required": true
    },
    {
      "id": "q2", 
      "text": "Do you have API credentials?",
      "node_id": "shopify-1",
      "field": "api_key",
      "type": "text",
      "required": true
    }
  ],
  "isComplete": false
}

Message types:
- "text": Plain text message
- "markdown": Message contains markdown formatting
- "code": Message contains code blocks

Question types:
- "text": Text input
- "password": Password input
- "select": Dropdown selection
- "multiselect": Multiple selection
- "textarea": Multi-line text input

Node types:
- source: databases, APIs, file systems
- transform: data processing, filtering, mapping
- destination: warehouses, APIs, applications

Node status:
- pending: initial state
- partial: some config provided
- complete: fully configured
- error: configuration issues

Remember: Respond with ONLY the JSON object, no markdown or code blocks.`;

export const processConversation = async (
  messages: ConversationMessage[]
): Promise<DataFlowResponse> => {
  try {
    const genAI = getGoogleAIClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Convert messages to Gemini format
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    // Add system prompt as first message
    const systemMessage = { role: 'user', content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...messages];
    
    // Send all messages to Gemini with timeout
    const result = await Promise.race([
      chat.sendMessage(allMessages.map(m => m.content).join('\n\n')),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout')), 30000)
      )
    ]);
    
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Google AI');
    }

    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    
    // Remove markdown code blocks if present
    if (content.includes('```json')) {
      const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
    }
    
    // Try to find JSON object
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          message: parsed.message || content,
          message_type: parsed.message_type || 'text',
          nodes: parsed.nodes || [],
          connections: parsed.connections || [],
          questions: parsed.questions || [],
          isComplete: parsed.isComplete || false,
        };
      } catch (parseError) {
        console.error('Failed to parse JSON from AI response:', parseError);
        console.error('Content was:', jsonContent);
        // Return fallback response instead of throwing
        return createFallbackResponse('I received a response but couldn\'t parse it properly. Please try again.');
      }
    }

    // Fallback: return the text response
    return createFallbackResponse(content);
  } catch (error: any) {
    console.error('Error calling Google AI:', error);
    
    // Return a graceful error response instead of throwing
    return createFallbackResponse(
      'I\'m having trouble processing your request right now. Please try again in a moment.',
      error.message
    );
  }
};

// Helper function to create fallback responses
const createFallbackResponse = (message: string, error?: string): DataFlowResponse => {
  if (error) {
    console.error('AI Service Error:', error);
  }
  
  return {
    message: message,
    message_type: 'text',
    nodes: [],
    connections: [],
    questions: [],
    isComplete: false,
  };
};

export const generateFlowFromDescription = async (
  description: string,
  conversationId: string
): Promise<DataFlowResponse> => {
  const messages: ConversationMessage[] = [
    {
      role: 'user',
      content: `I want to create a data flow: ${description}. Please help me set this up.`
    }
  ];

  // Store the initial conversation
  saveConversation(conversationId, messages);

  const response = await processConversation(messages);
  
  // Store the assistant's response
  const updatedMessages: ConversationMessage[] = [
    ...messages,
    {
      role: 'assistant' as const,
      content: JSON.stringify(response)
    }
  ];
  saveConversation(conversationId, updatedMessages);

  return response;
};

export const updateFlowWithAnswer = async (
  conversationId: string,
  answer: string
): Promise<DataFlowResponse> => {
  const conversationHistory = loadConversation(conversationId);
  
  if (!conversationHistory) {
    throw new Error('Conversation not found. Please start a new conversation.');
  }

  const messages: ConversationMessage[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: answer
    }
  ];

  const response = await processConversation(messages);
  
  // Store the updated conversation
  const updatedMessages: ConversationMessage[] = [
    ...messages,
    {
      role: 'assistant' as const,
      content: JSON.stringify(response)
    }
  ];
  saveConversation(conversationId, updatedMessages);

  return response;
};

// Helper function to get conversation history (for debugging)
export const getConversationHistory = (conversationId: string): ConversationMessage[] | undefined => {
  return loadConversation(conversationId) || undefined;
};

// Helper function to clear conversation (for cleanup)
export const clearConversation = (conversationId: string): boolean => {
  return deleteConversation(conversationId);
};

// Clear all conversations (call this on server start)
export const clearAllConversations = (): void => {
  try {
    if (fs.existsSync(CONVERSATIONS_DIR)) {
      const files = fs.readdirSync(CONVERSATIONS_DIR);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(CONVERSATIONS_DIR, file));
        }
      });
      console.log(`🧹 Cleared ${files.length} conversation files`);
    }
  } catch (error) {
    console.error('Failed to clear conversations:', error);
  }
};
