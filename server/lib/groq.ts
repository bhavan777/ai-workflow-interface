import fetch from 'node-fetch';

// In-memory conversation store for Edge Functions
const inMemoryConversations = new Map<string, ConversationMessage[]>();

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
  message_type: 'text' | 'markdown' | 'code';
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
  questions: Question[];
  isComplete: boolean;
}

const SYSTEM_PROMPT = `You are a data integration expert helping users build data pipelines. Your role is to:

1. Understand user requirements for data flows
2. Ask clarifying questions to gather necessary details
3. Generate structured data flow diagrams with nodes and connections
4. Provide configuration suggestions for each component

CRITICAL WORKFLOW REQUIREMENTS:
- ALWAYS create exactly 3 nodes: 1 source, 1 transform, 1 destination
- Source node: Where data comes from (databases, APIs, file systems)
- Transform node: Data processing, filtering, mapping, aggregation
- Destination node: Where data goes (warehouses, APIs, applications)
- Create connections: source → transform → destination

NODE STATUS PROGRESSION (CRITICAL):
- "pending": Initial state, no configuration provided
- "partial": Some configuration provided, but incomplete (when user provides some but not all required fields)
- "complete": Fully configured and ready to use (when all required fields are provided)
- "error": Configuration issues or validation failures

STATUS UPDATE RULES:
- When user provides answers, update relevant nodes from "pending" to "partial" or "complete"
- A node is "complete" when ALL its required fields are provided
- A node is "partial" when SOME but not all required fields are provided
- Set isComplete: true ONLY when ALL nodes are "complete" and no questions remain
- Always update node statuses based on the information provided in user answers

IMPORTANT: Always respond with ONLY a valid JSON object. Do not include markdown formatting, code blocks, or any other text.

CRITICAL JSON REQUIREMENTS:
- Ensure all strings are properly quoted with double quotes
- Use proper JSON syntax (commas, brackets, braces)
- Escape special characters in strings (\\n, \\t, \\")
- Do not include trailing commas
- Ensure all object properties are properly quoted

CRITICAL: When including code in responses:
- Wrap ALL code blocks in markdown format: \`\`\`python ... \`\`\`
- Script content in node configs should be properly formatted markdown
- Messages with message_type "code" must contain markdown code blocks

Response format (respond with ONLY this JSON structure):
{
  "message": "string",
  "message_type": "text|markdown|code",
  "nodes": [
    {
      "id": "source-node",
      "type": "source",
      "name": "Source Name",
      "status": "pending|partial|complete|error",
      "config": { "type": "service_type", "required_fields": [...] }
    },
    {
      "id": "transform-node", 
      "type": "transform",
      "name": "Transform Name",
      "status": "pending|partial|complete|error",
      "config": { "type": "operation_type", "required_fields": [...] }
    },
    {
      "id": "destination-node",
      "type": "destination", 
      "name": "Destination Name",
      "status": "pending|partial|complete|error",
      "config": { "type": "service_type", "required_fields": [...] }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "source": "source-node",
      "target": "transform-node",
      "status": "complete"
    },
    {
      "id": "conn-2", 
      "source": "transform-node",
      "target": "destination-node",
      "status": "complete"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "text": "What is your database connection string?",
      "node_id": "source-node",
      "field": "connection_string",
      "type": "password",
      "required": true
    }
  ],
  "isComplete": false
}`;

// Groq Cloud AI client with intelligent model selection
export class GroqCloudClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
    if (!apiKey.startsWith('gsk_')) {
      throw new Error('Invalid GROQ_API_KEY format. Should start with "gsk_"');
    }
    this.apiKey = apiKey;
  }

  // Validate API key by making a test request
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.',
            },
          ],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Groq API validation failed:', errorData);
        return false;
      }

      console.log('✅ Groq API key validated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error validating Groq API key:', error);
      return false;
    }
  }

  // Get the best available model based on requirements
  private getBestModel(requirements: {
    maxTokens?: number;
    speed?: 'fast' | 'balanced' | 'quality';
    cost?: 'low' | 'medium' | 'high';
  }): string {
    const {
      maxTokens = 4000,
      speed = 'balanced',
      cost = 'medium',
    } = requirements;

    // Updated model selection with current available models
    // Priority: mixtral-8x7b-32768 (most reliable), then llama3-8b-8192
    if (maxTokens > 8000 || speed === 'quality') {
      return 'mixtral-8x7b-32768'; // Best quality, highest token limit
    } else if (speed === 'fast' || cost === 'low') {
      return 'llama3-8b-8192'; // Fastest and cheapest
    } else {
      return 'mixtral-8x7b-32768'; // Balanced option (most reliable)
    }
  }

  // Generate response with automatic model selection and fallback
  async generateResponse(
    messages: ConversationMessage[],
    options: {
      maxTokens?: number;
      temperature?: number;
      speed?: 'fast' | 'balanced' | 'quality';
      cost?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<string> {
    const {
      maxTokens = 4000,
      temperature = 0.7,
      speed = 'balanced',
      cost = 'medium',
    } = options;

    // Define available models in order of preference
    const availableModels = [
      'mixtral-8x7b-32768', // Most reliable, high token limit
      'llama3-8b-8192', // Fast, good for simple tasks
      'llama3-70b-8192', // High quality, but may hit rate limits
    ];

    let lastError: Error | null = null;

    // Try each model until one works
    for (const model of availableModels) {
      try {
        console.log(`🤖 Trying Groq model: ${model}`);
        console.log(`📝 Input messages: ${messages.length} messages`);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            max_tokens: maxTokens,
            temperature,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`⚠️ Model ${model} failed:`, errorData.error?.message);

          // If it's a rate limit, try the next model
          if (errorData.error?.code === 'rate_limit_exceeded') {
            lastError = new Error(
              `Rate limit for ${model}: ${errorData.error?.message}`
            );
            continue;
          }

          // For other errors, throw immediately
          throw new Error(
            `Groq API error: ${errorData.error?.message || 'Unknown error'}`
          );
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error('No content received from Groq API');
        }

        console.log(
          `✅ Generated response with ${model} (${content.length} characters)`
        );
        return content;
      } catch (error: any) {
        console.warn(`⚠️ Model ${model} failed:`, error.message);
        lastError = error;

        // If it's not a rate limit error, throw immediately
        if (!error.message.includes('rate_limit')) {
          throw error;
        }

        // For rate limits, continue to next model
        continue;
      }
    }

    // If all models failed, throw the last error
    throw lastError || new Error('All available models failed');
  }
}

// In-memory conversation storage functions
const saveConversation = (
  conversationId: string,
  messages: ConversationMessage[]
): void => {
  inMemoryConversations.set(conversationId, messages);
};

const loadConversation = (
  conversationId: string
): ConversationMessage[] | null => {
  return inMemoryConversations.get(conversationId) || null;
};

const deleteConversation = (conversationId: string): boolean => {
  return inMemoryConversations.delete(conversationId);
};

// Process conversation with AI
const processConversation = async (
  messages: ConversationMessage[],
  sendThought?: (thought: string) => void
): Promise<DataFlowResponse> => {
  const groqClient = new GroqCloudClient();

  // Add system prompt
  const systemMessage: ConversationMessage = {
    role: 'system',
    content: SYSTEM_PROMPT,
  };

  const allMessages = [systemMessage, ...messages];

  if (sendThought) {
    sendThought('🤔 Analyzing your requirements...');
    sendThought('🔧 Generating workflow structure...');
    sendThought('📊 Creating data flow nodes...');
    sendThought('🔗 Establishing connections...');
    sendThought('✅ Finalizing workflow configuration...');
  }

  const response = await groqClient.generateResponse(allMessages, {
    maxTokens: 4000,
    temperature: 0.7,
  });

  try {
    // Try to parse as JSON first
    const parsedResponse = JSON.parse(response);
    return parsedResponse as DataFlowResponse;
  } catch (error) {
    console.error('❌ Failed to parse AI response as JSON:', error);
    console.log('Raw response:', response);

    // Fallback: create a basic response structure
    return {
      message:
        'I understand your requirements. Let me help you set up a data workflow.',
      message_type: 'text',
      nodes: [
        {
          id: 'source-node',
          type: 'source',
          name: 'Data Source',
          status: 'pending',
          config: { type: 'unknown', required_fields: [] },
        },
        {
          id: 'transform-node',
          type: 'transform',
          name: 'Data Transform',
          status: 'pending',
          config: { type: 'unknown', required_fields: [] },
        },
        {
          id: 'destination-node',
          type: 'destination',
          name: 'Data Destination',
          status: 'pending',
          config: { type: 'unknown', required_fields: [] },
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'source-node',
          target: 'transform-node',
          status: 'pending',
        },
        {
          id: 'conn-2',
          source: 'transform-node',
          target: 'destination-node',
          status: 'pending',
        },
      ],
      questions: [],
      isComplete: false,
    };
  }
};

// Main functions for workflow generation
export const generateFlowFromDescription = async (
  description: string,
  conversationId: string,
  sendThought?: (thought: string) => void
): Promise<DataFlowResponse> => {
  const messages: ConversationMessage[] = [
    {
      role: 'user',
      content: `I want to create a data flow: ${description}. Please help me set this up.`,
    },
  ];

  // Store the initial conversation
  saveConversation(conversationId, messages);

  const response = await processConversation(messages, sendThought);

  // Store the assistant's response
  const updatedMessages: ConversationMessage[] = [
    ...messages,
    {
      role: 'assistant',
      content: JSON.stringify(response),
    },
  ];
  saveConversation(conversationId, updatedMessages);

  return response;
};

export const updateFlowWithAnswer = async (
  conversationId: string,
  answer: string,
  sendThought?: (thought: string) => void
): Promise<DataFlowResponse> => {
  const conversationHistory = loadConversation(conversationId);

  if (!conversationHistory) {
    throw new Error('Conversation not found. Please start a new conversation.');
  }

  // Create a more specific message for the AI to understand this is a continuation
  const continueMessage = `The user has provided the following answer to continue configuring the workflow: "${answer}". Please update the workflow nodes, their statuses, and configurations based on this information. Remember to update node statuses from "pending" to "partial" or "complete" based on what information was provided.`;

  const messages: ConversationMessage[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: continueMessage,
    },
  ];

  const response = await processConversation(messages, sendThought);

  // Store the updated conversation
  const updatedMessages: ConversationMessage[] = [
    ...messages,
    {
      role: 'assistant',
      content: JSON.stringify(response),
    },
  ];
  saveConversation(conversationId, updatedMessages);

  return response;
};

// Helper function to get conversation history (for debugging)
export const getConversationHistory = (
  conversationId: string
): ConversationMessage[] | null => {
  return loadConversation(conversationId);
};

// Function to clear all conversations
export const clearAllConversations = (): void => {
  inMemoryConversations.clear();
  console.log('✅ All conversations cleared (memory)');
};
