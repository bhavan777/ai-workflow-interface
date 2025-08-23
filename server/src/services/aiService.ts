import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';

// File-based conversation store for persistence
const CONVERSATIONS_DIR = path.join(__dirname, '../../conversations');

// In-memory fallback for production environments
const inMemoryConversations = new Map<string, ConversationMessage[]>();

// Ensure conversations directory exists
if (!fs.existsSync(CONVERSATIONS_DIR)) {
  try {
    fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
  } catch (error) {
    console.warn(
      '⚠️ Could not create conversations directory, using in-memory storage'
    );
  }
}

const getConversationPath = (conversationId: string): string => {
  return path.join(CONVERSATIONS_DIR, `${conversationId}.json`);
};

const saveConversation = (
  conversationId: string,
  messages: ConversationMessage[]
): void => {
  try {
    // Try file system first
    const filePath = getConversationPath(conversationId);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.warn('⚠️ File system save failed, using in-memory storage:', error);
    // Fallback to in-memory storage
    inMemoryConversations.set(conversationId, messages);
  }
};

const loadConversation = (
  conversationId: string
): ConversationMessage[] | null => {
  try {
    // Try file system first
    const filePath = getConversationPath(conversationId);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(
      '⚠️ File system load failed, trying in-memory storage:',
      error
    );
  }

  // Fallback to in-memory storage
  return inMemoryConversations.get(conversationId) || null;
};

const deleteConversation = (conversationId: string): boolean => {
  try {
    const filePath = getConversationPath(conversationId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('⚠️ File system delete failed:', error);
  }

  // Also remove from in-memory storage
  return inMemoryConversations.delete(conversationId);
};

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
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      });

      if (response.status === 401) {
        throw new Error('Invalid GROQ_API_KEY');
      }

      return response.ok;
    } catch (error) {
      console.error('❌ Groq API key validation failed:', error);
      return false;
    }
  }

  // Intelligent model selection based on task type
  private selectBestModel(messages: ConversationMessage[]): string {
    const lastUserMessage =
      messages.filter(m => m.role === 'user').pop()?.content || '';
    const messageLength = lastUserMessage.length;

    // Analyze the complexity of the request
    const complexityIndicators = [
      'complex',
      'advanced',
      'detailed',
      'comprehensive',
      'multiple',
      'integration',
      'database',
      'transform',
      'pipeline',
      'workflow',
    ];

    const speedIndicators = [
      'quick',
      'simple',
      'basic',
      'fast',
      'test',
      'check',
    ];

    const hasComplexity = complexityIndicators.some(indicator =>
      lastUserMessage.toLowerCase().includes(indicator)
    );

    const needsSpeed = speedIndicators.some(indicator =>
      lastUserMessage.toLowerCase().includes(indicator)
    );

    // Model selection logic - using current available models
    if (needsSpeed && messageLength < 100) {
      console.log('🚀 Using LLaMA 3.1 8B for fast, simple task');
      return 'llama3-8b-8192';
    } else if (hasComplexity || messageLength > 200) {
      console.log('🧠 Using LLaMA 3.3 70B for complex task');
      return 'llama-3.3-70b-versatile';
    } else {
      console.log('⚡ Using LLaMA 3.1 8B Instant for balanced performance');
      return 'llama-3.1-8b-instant';
    }
  }

  async generateResponse(messages: ConversationMessage[]): Promise<string> {
    // Automatically select the best model for this task
    const selectedModel = this.selectBestModel(messages);

    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: openAIMessages,
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Groq Cloud API error: ${response.status} - ${errorText}`
      );
    }

    const data = (await response.json()) as any;
    return data.choices[0].message.content;
  }
}

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
      "config": { "type": "processing_type", "operations": [...] }
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
      "source": "source-node",
      "target": "transform-node"
    },
    {
      "source": "transform-node", 
      "target": "destination-node"
    }
  ],
  "questions": [
    {
      "id": "question-id",
      "text": "Question text?",
      "node_id": "node-id",
      "field": "field_name",
      "type": "text|password|select|multiselect|textarea",
      "required": true
    }
  ],
  "isComplete": false
}

Message types:
- "text": Plain text message
- "markdown": Message contains markdown formatting
- "code": Message contains code blocks (wrap in markdown code blocks)

Question types:
- "text": Text input
- "password": Password input
- "select": Dropdown selection
- "multiselect": Multiple selection
- "textarea": Multi-line text input

Node types:
- source: databases, APIs, file systems, data sources
- transform: data processing, filtering, mapping, aggregation, cleaning
- destination: warehouses, APIs, applications, data sinks

Node status progression:
- pending: initial state, no configuration
- partial: some config provided, but incomplete
- complete: fully configured and ready
- error: configuration issues or validation failures

CONVERSATION CONTINUE RULES:
- When processing user answers, extract relevant information and update node configurations
- Update node statuses based on provided information:
  * If ALL required fields for a node are provided → status: "complete"
  * If SOME required fields for a node are provided → status: "partial"  
  * If NO required fields for a node are provided → status: "pending"
- IMPORTANT: Transform nodes should be configured with default processing logic when source and destination are provided
- Transform node configuration should include data processing operations like cleaning, validation, or transformation
- Remove questions that have been answered
- Add new questions only if more information is needed
- Set isComplete: true when ALL nodes are "complete" and no questions remain
- If source and destination are complete, configure transform node with default processing logic and mark it complete
- Always preserve existing node configurations and only update what's provided
- CRITICAL: When all 3 nodes are "complete", set isComplete: true and remove all questions

Remember: ALWAYS create exactly 3 nodes (source, transform, destination) and respond with ONLY the JSON object, no markdown or code blocks.`;

export const processConversation = async (
  messages: ConversationMessage[],
  sendThought?: (thought: string) => void
): Promise<DataFlowResponse> => {
  try {
    console.log('🔄 Starting processConversation with Groq Cloud...');

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      return {
        message:
          'AI service is not configured. Please set the GROQ_API_KEY environment variable.',
        message_type: 'text',
        nodes: [],
        connections: [],
        questions: [],
        isComplete: false,
      };
    }

    let groqClient: GroqCloudClient;
    try {
      groqClient = new GroqCloudClient();
      console.log('🤖 Groq Cloud client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Groq client:', error);
      return {
        message:
          'AI service configuration error. Please check your GROQ_API_KEY.',
        message_type: 'text',
        nodes: [],
        connections: [],
        questions: [],
        isComplete: false,
      };
    }

    // Add system prompt as first message
    const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...messages];

    console.log('📤 Sending to Groq Cloud...');
    sendThought?.('🤖 Generating response from Groq Cloud...');

    // Send to Groq Cloud with increased timeout and retry logic
    let result: string | undefined;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/3 to call Groq Cloud...`);
        result = await Promise.race([
          groqClient.generateResponse(allMessages),
          new Promise<never>(
            (_, reject) =>
              setTimeout(
                () => reject(new Error('Groq Cloud API timeout')),
                60000
              ) // Increased to 60 seconds
          ),
        ]);
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
      }
    }

    if (!result) {
      throw lastError || new Error('All retry attempts failed');
    }

    console.log('✅ Groq Cloud response received');
    const content = result;

    if (!content) {
      throw new Error('No response from Groq Cloud');
    }

    console.log('📄 Raw Groq Cloud content:', content);

    // Try to extract JSON from the response
    let jsonContent = content;

    // Remove markdown code blocks if present
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    } else if (content.includes('```')) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    }

    // Parse the JSON
    const parsed = JSON.parse(jsonContent);
    console.log('✅ JSON parsed successfully');

    // Validate the response structure
    if (
      !parsed.message ||
      !parsed.nodes ||
      !parsed.connections ||
      !parsed.questions
    ) {
      throw new Error('Invalid response structure');
    }

    return {
      message: parsed.message,
      message_type: parsed.message_type || 'text',
      nodes: parsed.nodes || [],
      connections: parsed.connections || [],
      questions: parsed.questions || [],
      isComplete: parsed.isComplete || false,
    };
  } catch (error: any) {
    console.error('💥 Error calling Groq Cloud:', error);

    // Return a graceful error response
    return {
      message:
        "I'm having trouble processing your request right now. Please try again in a moment.",
      message_type: 'text',
      nodes: [],
      connections: [],
      questions: [],
      isComplete: false,
    };
  }
};

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
      role: 'assistant' as const,
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
      role: 'assistant' as const,
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
  try {
    // Clear file system conversations
    const files = fs.readdirSync(CONVERSATIONS_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CONVERSATIONS_DIR, file));
      }
    });
  } catch (error) {
    console.warn('⚠️ Could not clear file system conversations:', error);
  }

  // Clear in-memory conversations
  inMemoryConversations.clear();
  console.log('✅ All conversations cleared (file system + memory)');
};
