import * as fs from 'fs';
import * as path from 'path';

// File-based conversation store for persistence
const CONVERSATIONS_DIR = path.join(__dirname, '../../conversations');

// In-memory fallback for production environments
const inMemoryConversations = new Map<string, Message[]>();

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

export const saveConversation = (
  conversationId: string,
  messages: Message[]
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

const loadConversation = (conversationId: string): Message[] | null => {
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

// Improved Groq Cloud AI client with automatic model fallback
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

  // Generate response with automatic model selection and fallback
  async generateResponse(
    messages: any[],
    options: {
      maxTokens?: number;
      temperature?: number;
      speed?: 'fast' | 'balanced' | 'quality';
      cost?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<string> {
    const {
      maxTokens = 4000, // Restored for Dev Tier with higher limits
      temperature = 0.1, // Lower temperature for more consistent JSON generation
      speed = 'balanced',
      cost = 'medium',
    } = options;

    // Define available models in order of preference - prioritize quality for JSON generation
    const availableModels = [
      'llama3-70b-8192', // High quality, best for JSON generation
      'mixtral-8x7b-32768', // Alternative high-quality model
      'llama3-8b-8192', // Fallback to faster model
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
          const errorData = (await response.json()) as any;
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

        const data = (await response.json()) as any;
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

export interface Message {
  id: string; // Unique message ID
  response_to?: string; // ID of message this responds to (for conversation threading)
  role: 'user' | 'assistant'; // Who sent the message
  type: 'MESSAGE' | 'THOUGHT' | 'ERROR' | 'STATUS';
  content: string; // Main message content (or thought content)
  timestamp: string; // ISO timestamp

  // For assistant MESSAGE responses - only include if workflow state changed
  nodes?: DataFlowNode[];
  connections?: DataFlowConnection[];
  workflow_complete?: boolean; // Indicates if the workflow configuration is complete

  // For status updates
  status?: 'processing' | 'complete' | 'error';
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

const SYSTEM_PROMPT = `You are a data integration expert. Respond with ONLY valid JSON.

CRITICAL: You MUST respond with ONLY a valid JSON object. No text before or after the JSON. No explanations. Just the JSON.

WORKFLOW: 3 nodes (Source → Transform → Destination). Each needs 3 data points.

TONE: Enthusiastic, professional, proactive. User wants to move forward - ask directly for what you need.

SERVICE VALIDATION: You can work with any valid data source/destination services based on your knowledge. Determine if services mentioned are valid for data transformation.

SERVICE EXAMPLES (but not limited to):
- Sources: Shopify, Salesforce, MySQL, PostgreSQL, MongoDB, API endpoints, CSV files, etc.
- Destinations: Snowflake, BigQuery, AWS S3, Google Sheets, email, webhooks, etc.
- Transform: Always needs operation_type, parameters, output_format

RESPONSE FORMAT - COPY THIS EXACTLY:
{
  "message": "[Proactive message directly asking for the next piece of information needed]",
  "nodes": [
    {
      "id": "source-node",
      "type": "source",
      "name": "[Service Name] Source", 
      "status": "pending|partial|complete",
      "config": {},
      "data_requirements": {
        "required_fields": ["field1", "field2", "field3"],
        "provided_fields": [],
        "missing_fields": ["field1", "field2", "field3"]
      }
    },
    {
      "id": "transform-node",
      "type": "transform", 
      "name": "Data Transform",
      "status": "pending|partial|complete",
      "config": {},
      "data_requirements": {
        "required_fields": ["operation_type", "parameters", "output_format"],
        "provided_fields": [],
        "missing_fields": ["operation_type", "parameters", "output_format"]
      }
    },
    {
      "id": "destination-node",
      "type": "destination",
      "name": "[Service Name] Destination",
      "status": "pending|partial|complete", 
      "config": {},
      "data_requirements": {
        "required_fields": ["field1", "field2", "field3"],
        "provided_fields": [],
        "missing_fields": ["field1", "field2", "field3"]
      }
    }
  ],
  "connections": [
    {"id": "conn1", "source": "source-node", "target": "transform-node", "status": "pending"},
    {"id": "conn2", "source": "transform-node", "target": "destination-node", "status": "pending"}
  ],
  "workflow_complete": false
}

CRITICAL RULES:
- ALWAYS maintain the exact same JSON structure in every response
- ALWAYS include all 3 nodes in every response (source-node, transform-node, destination-node)
- ALWAYS include both connections in every response
- Each node needs exactly 3 data points (no more, no less)
- Update node status based on completion: pending → partial → complete
- Store actual values securely on server side (not in WebSocket messages)
- Only send field names and completion status over WebSocket
- Use data_requirements to track what's provided vs missing
- Set node.config to empty object {} - actual values stored separately
- Update data_requirements.provided_fields with field names that have values
- Update data_requirements.missing_fields with field names still needed
- Never send sensitive data (API keys, passwords) over WebSocket
- Only ask for one piece of data at a time
- Progress automatically to next node when current node is complete
- Be enthusiastic and proactive - user wants to move forward
- Ask directly for what you need - no confirmations or permissions
- Assume user is ready to provide information
- IMPORTANT: You will receive the current workflow state - update it incrementally, don't replace it entirely

SERVICE-SPECIFIC FIELD DETERMINATION:
- For Shopify Source: use ["store_url", "api_key", "api_secret"]
- For Snowflake Destination: use ["account_url", "username", "password"]
- For MySQL/PostgreSQL: use ["host", "database", "credentials"]
- For API endpoints: use ["base_url", "auth_method", "endpoint"]
- For CSV files: use ["file_path", "delimiter", "encoding"]
- For Transform: always use ["operation_type", "parameters", "output_format"]
- For unknown services: use ["connection_string", "username", "password"]

SERVICE VALIDATION:
- Accept any service you recognize as valid for data transformation
- If service is unclear, ask directly for clarification or use generic fields
- Reject services that don't make sense for data workflows (e.g., "my cat" is not a valid service)

PROACTIVE BEHAVIOR:
- User started the workflow because they want to proceed
- Ask directly for information - don't ask "shall we proceed" or "are you ready"
- Move forward confidently - user is already committed to the process
- Be direct and efficient - get the information you need to complete the workflow

STATE MANAGEMENT:
- You will receive the current workflow state in every request
- Update only the parts that have changed based on user input
- Maintain the same node IDs, connection IDs, and overall structure
- Preserve existing data_requirements.provided_fields and update missing_fields accordingly
- Keep the same node names unless the user specifies a different service`;

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to ensure all 3 nodes are always present
const ensureAllNodesPresent = (nodes: DataFlowNode[]): DataFlowNode[] => {
  const requiredNodeIds = ['source-node', 'transform-node', 'destination-node'];
  const existingNodeIds = nodes.map(node => node.id);

  // If all required nodes are present, return as is
  if (requiredNodeIds.every(id => existingNodeIds.includes(id))) {
    return nodes;
  }

  // Create missing nodes
  const missingNodes: DataFlowNode[] = [];

  if (!existingNodeIds.includes('source-node')) {
    missingNodes.push({
      id: 'source-node',
      type: 'source',
      name: 'Data Source',
      status: 'pending',
      config: {},
      data_requirements: {
        required_fields: ['field1', 'field2', 'field3'],
        provided_fields: [],
        missing_fields: ['field1', 'field2', 'field3'],
      },
    });
  }

  if (!existingNodeIds.includes('transform-node')) {
    missingNodes.push({
      id: 'transform-node',
      type: 'transform',
      name: 'Data Transform',
      status: 'pending',
      config: {},
      data_requirements: {
        required_fields: ['operation_type', 'parameters', 'output_format'],
        provided_fields: [],
        missing_fields: ['operation_type', 'parameters', 'output_format'],
      },
    });
  }

  if (!existingNodeIds.includes('destination-node')) {
    missingNodes.push({
      id: 'destination-node',
      type: 'destination',
      name: 'Data Destination',
      status: 'pending',
      config: {},
      data_requirements: {
        required_fields: ['field1', 'field2', 'field3'],
        provided_fields: [],
        missing_fields: ['field1', 'field2', 'field3'],
      },
    });
  }

  return [...nodes, ...missingNodes];
};

// Helper function to get current workflow state from conversation history
const getCurrentWorkflowState = (
  conversationHistory: Message[]
): { nodes?: DataFlowNode[]; connections?: DataFlowConnection[] } => {
  // Find the last message with nodes and connections
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const message = conversationHistory[i];
    if (message.nodes && message.connections) {
      return { nodes: message.nodes, connections: message.connections };
    }
  }
  return {};
};

// Helper function to merge new node data with existing nodes
const mergeNodesData = (
  existingNodes: DataFlowNode[],
  newNodes: DataFlowNode[]
): DataFlowNode[] => {
  const mergedNodes: DataFlowNode[] = [];

  // Create a map of existing nodes by ID for quick lookup
  const existingNodesMap = new Map<string, DataFlowNode>();
  existingNodes.forEach(node => existingNodesMap.set(node.id, node));

  // Process each new node
  newNodes.forEach(newNode => {
    const existingNode = existingNodesMap.get(newNode.id);

    if (existingNode) {
      // Merge with existing node - preserve existing config and update with new data
      const mergedNode: DataFlowNode = {
        ...existingNode,
        name: newNode.name || existingNode.name,
        status: newNode.status || existingNode.status,
        // Merge config objects, preferring new values but keeping existing ones
        config: {
          ...existingNode.config,
          ...newNode.config,
        },
        // Update data requirements with new information
        data_requirements:
          newNode.data_requirements || existingNode.data_requirements,
        // Keep existing position if available
        position: existingNode.position || newNode.position,
      };

      mergedNodes.push(mergedNode);
    } else {
      // New node, add as is
      mergedNodes.push(newNode);
    }
  });

  // Ensure all required nodes are present
  return ensureAllNodesPresent(mergedNodes);
};

// Helper function to check if workflow state has changed
const hasWorkflowStateChanged = (
  currentState: { nodes?: DataFlowNode[]; connections?: DataFlowConnection[] },
  newResponse: any
): boolean => {
  // If no current state, any new state is a change
  if (!currentState.nodes && !currentState.connections) {
    return !!(newResponse.nodes || newResponse.connections);
  }

  // Compare nodes - check for meaningful changes
  if (newResponse.nodes && currentState.nodes) {
    // Check if any node status, config, or data_requirements have changed
    for (
      let i = 0;
      i < Math.min(currentState.nodes.length, newResponse.nodes.length);
      i++
    ) {
      const currentNode = currentState.nodes[i];
      const newNode = newResponse.nodes[i];

      if (currentNode.id === newNode.id) {
        // Check for meaningful changes
        if (
          currentNode.status !== newNode.status ||
          JSON.stringify(currentNode.config) !==
            JSON.stringify(newNode.config) ||
          JSON.stringify(currentNode.data_requirements) !==
            JSON.stringify(newNode.data_requirements)
        ) {
          return true;
        }
      }
    }
  }

  // Compare connections
  if (newResponse.connections) {
    if (
      !currentState.connections ||
      JSON.stringify(currentState.connections) !==
        JSON.stringify(newResponse.connections)
    ) {
      return true;
    }
  }

  return false;
};

// Helper function to create initial workflow state
const createInitialWorkflowState = (): {
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
} => {
  return {
    nodes: [
      {
        id: 'source-node',
        type: 'source',
        name: 'Data Source',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: ['field1', 'field2', 'field3'],
          provided_fields: [],
          missing_fields: ['field1', 'field2', 'field3'],
        },
      },
      {
        id: 'transform-node',
        type: 'transform',
        name: 'Data Transform',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: ['operation_type', 'parameters', 'output_format'],
          provided_fields: [],
          missing_fields: ['operation_type', 'parameters', 'output_format'],
        },
      },
      {
        id: 'destination-node',
        type: 'destination',
        name: 'Data Destination',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: ['field1', 'field2', 'field3'],
          provided_fields: [],
          missing_fields: ['field1', 'field2', 'field3'],
        },
      },
    ],
    connections: [
      {
        id: 'conn1',
        source: 'source-node',
        target: 'transform-node',
        status: 'pending',
      },
      {
        id: 'conn2',
        source: 'transform-node',
        target: 'destination-node',
        status: 'pending',
      },
    ],
  };
};

export const processMessage = async (
  conversationHistory: Message[],
  currentMessage: Message,
  sendThought?: (thought: string) => void,
  jsonRetryCount: number = 0
): Promise<Message> => {
  try {
    console.log('🔄 Starting processMessage with Groq Cloud...');
    console.log(
      `📚 Conversation history length: ${conversationHistory.length}`
    );
    console.log(`📝 Current message: ${currentMessage.content}`);

    // Log the last few messages for debugging
    const recentMessages = conversationHistory.slice(-5);
    console.log('📋 Recent conversation history:');
    recentMessages.forEach((msg, index) => {
      console.log(
        `  ${index + 1}. [${msg.role}] ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
      );
    });

    // Log current workflow state
    const currentWorkflowState = getCurrentWorkflowState(conversationHistory);
    console.log(
      '🔧 Current workflow state:',
      JSON.stringify(currentWorkflowState, null, 2)
    );
    console.log('📝 Current message content:', currentMessage.content);

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      return {
        id: generateId(),
        role: 'assistant',
        type: 'ERROR',
        content:
          'AI service is not configured. Please set the GROQ_API_KEY environment variable.',
        timestamp: new Date().toISOString(),
      };
    }

    let groqClient: GroqCloudClient;
    try {
      groqClient = new GroqCloudClient();
      console.log('🤖 Groq Cloud client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Groq client:', error);
      return {
        id: generateId(),
        role: 'assistant',
        type: 'ERROR',
        content:
          'AI service configuration error. Please check your GROQ_API_KEY.',
        timestamp: new Date().toISOString(),
      };
    }

    sendThought?.('🤔 Understanding your workflow requirements...');

    // Get current workflow state for context - always ensure we have a complete state
    let existingWorkflowState = getCurrentWorkflowState(conversationHistory);

    // If no existing state, create initial state
    if (
      !existingWorkflowState.nodes ||
      existingWorkflowState.nodes.length === 0
    ) {
      existingWorkflowState = createInitialWorkflowState();
    }

    // Convert conversation history to AI format - limit to last 5 messages to reduce tokens
    const recentHistory = conversationHistory.slice(-5);
    const aiMessages = recentHistory.map(msg => ({
      role: msg.role,
      content: formatMessageForAI(msg),
    }));

    // Add current message
    aiMessages.push({
      role: currentMessage.role,
      content: formatMessageForAI(currentMessage),
    });

    // ALWAYS send current workflow state to AI so it knows exactly what needs to be updated
    aiMessages.push({
      role: 'user' as const,
      content: `CURRENT WORKFLOW STATE:\n${JSON.stringify(existingWorkflowState, null, 2)}\n\nUpdate this state based on the user's latest input. Maintain the same structure and only update what has changed.`,
    });

    // Add system prompt as first message
    const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...aiMessages];

    console.log(
      '🤖 System prompt being sent (first 1000 chars):',
      SYSTEM_PROMPT.substring(0, 1000)
    );
    console.log('🔄 Force rebuild timestamp:', new Date().toISOString());
    console.log('📝 Total messages being sent:', allMessages.length);

    console.log('📤 Sending to Groq Cloud...');
    sendThought?.('💭 Building your workflow structure...');

    // Send to Groq Cloud with timeout
    const result = await Promise.race([
      groqClient.generateResponse(allMessages),
      new Promise<never>(
        (_, reject) =>
          setTimeout(() => reject(new Error('Groq Cloud API timeout')), 60000) // 60 seconds timeout
      ),
    ]);

    console.log('✅ Groq Cloud response received');
    const content = result;

    if (!content) {
      throw new Error('No response from Groq Cloud');
    }

    console.log('📄 Raw Groq Cloud content:', content);
    console.log('📄 Content length:', content.length);
    console.log('📄 First 200 chars:', content.substring(0, 200));

    sendThought?.('🔍 Validating your workflow...');

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

    console.log('🔍 Attempting to parse JSON:', jsonContent);

    // Try to parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
      console.log('✅ JSON parsed successfully');
      console.log('📋 Parsed content:', JSON.stringify(parsed, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.log('📄 Attempted to parse:', jsonContent);

      // Try to repair common JSON issues
      let repairedJson = jsonContent;

      // Remove any text before the first {
      const firstBrace = repairedJson.indexOf('{');
      if (firstBrace > 0) {
        repairedJson = repairedJson.substring(firstBrace);
      }

      // Remove any text after the last }
      const lastBrace = repairedJson.lastIndexOf('}');
      if (lastBrace > 0 && lastBrace < repairedJson.length - 1) {
        repairedJson = repairedJson.substring(0, lastBrace + 1);
      }

      // Try to fix common syntax errors
      repairedJson = repairedJson
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(
          /([a-zA-Z0-9_]+):\s*([^",\{\}\[\]\s][^,\{\}\[\]]*[^",\{\}\[\]\s])\s*([,\}\]])/g,
          '"$1": "$2"$3'
        ) // Add quotes to unquoted values
        .replace(
          /([a-zA-Z0-9_]+):\s*([^",\{\}\[\]\s][^,\{\}\[\]]*[^",\{\}\[\]\s])/g,
          '"$1": "$2"'
        ); // Add quotes to last unquoted values

      console.log('🔧 Attempting to repair JSON:', repairedJson);
      sendThought?.('🔧 Fixing the response...');

      try {
        parsed = JSON.parse(repairedJson);
        console.log('✅ JSON repaired and parsed successfully');
        console.log('📋 Repaired content:', JSON.stringify(parsed, null, 2));
      } catch (repairError) {
        console.error('❌ Failed to repair JSON:', repairError);

        // Check if we've exceeded the retry limit (max 3 attempts)
        if (jsonRetryCount >= 3) {
          console.error(
            '❌ Max JSON retry attempts reached, falling back gracefully'
          );

          // Send a final thought message to inform the user
          sendThought?.('😔 Having trouble with this request...');

          // Return a graceful error response
          return {
            id: generateId(),
            response_to: currentMessage.id,
            role: 'assistant',
            type: 'ERROR',
            content:
              "I'm having trouble processing your request due to a technical issue. Please try again in a moment, or rephrase your request.",
            timestamp: new Date().toISOString(),
          };
        }

        // Send the invalid JSON back to the AI to fix it
        console.log(
          `🔄 JSON retry attempt ${jsonRetryCount + 1}/3 - asking AI to fix invalid JSON`
        );

        // Send user-friendly thought messages based on retry attempt
        const retryMessages = [
          '🔄 Rephrasing the response...',
          '💡 Trying a different approach...',
          '✨ Almost there...',
        ];

        const thoughtMessage =
          retryMessages[jsonRetryCount] || '🤔 Let me think about this...';
        sendThought?.(thoughtMessage);

        // Create a message asking the AI to fix the JSON
        const fixJsonMessage: Message = {
          id: generateId(),
          role: 'user',
          type: 'MESSAGE',
          content: `The JSON response you provided is invalid and couldn't be parsed. Please fix the JSON syntax and respond with valid JSON. Here's what you sent: \`\`\`json\n${jsonContent}\n\`\`\`\n\nPlease provide a corrected JSON response.`,
          timestamp: new Date().toISOString(),
        };

        // Add the fix request to conversation history
        const updatedHistory = [...conversationHistory, fixJsonMessage];

        // Recursively call processMessage with the fix request
        return await processMessage(
          updatedHistory,
          fixJsonMessage,
          sendThought,
          jsonRetryCount + 1
        );
      }
    }

    // Validate the response structure
    if (!parsed.message) {
      throw new Error('Invalid response structure - missing message');
    }

    console.log('🔍 Parsed response structure:');
    console.log('  - Has message:', !!parsed.message);
    console.log('  - Has nodes:', !!parsed.nodes);
    console.log('  - Has connections:', !!parsed.connections);
    console.log('  - Nodes count:', parsed.nodes?.length || 0);

    // Since we're sending current state to AI, we can trust its response
    if (parsed.nodes && Array.isArray(parsed.nodes)) {
      // Only ensure all 3 nodes are present if some are missing
      if (parsed.nodes.length < 3) {
        parsed.nodes = ensureAllNodesPresent(parsed.nodes);
      }
      console.log(
        '✅ Final nodes structure:',
        parsed.nodes.map((n: DataFlowNode) => `${n.id} (${n.status})`)
      );
    }

    sendThought?.('✨ Perfect! I have what you need.');

    // Merge the AI response with existing state to ensure we maintain the complete structure
    const updatedNodes = parsed.nodes
      ? mergeNodesData(existingWorkflowState.nodes || [], parsed.nodes)
      : existingWorkflowState.nodes;
    const updatedConnections =
      parsed.connections || existingWorkflowState.connections;

    // Convert AI response back to our message format
    const response: Message = {
      id: generateId(),
      response_to: currentMessage.id,
      role: 'assistant',
      type: 'MESSAGE',
      content: parsed.message,
      timestamp: new Date().toISOString(),
    };

    // ALWAYS include the complete updated workflow state
    response.nodes = updatedNodes;
    response.connections = updatedConnections;

    // Include workflow completion status
    if (parsed.workflow_complete !== undefined) {
      response.workflow_complete = parsed.workflow_complete;
    }

    return response;
  } catch (error: any) {
    console.error('💥 Error calling Groq Cloud:', error);

    // Return a graceful error response
    return {
      id: generateId(),
      response_to: currentMessage.id,
      role: 'assistant',
      type: 'ERROR',
      content:
        "I'm having trouble processing your request right now. Please try again in a moment.",
      timestamp: new Date().toISOString(),
    };
  }
};

const formatMessageForAI = (message: Message): string => {
  return message.content; // Just the text content
};

// Helper function to get conversation history (for debugging)
export const getConversationHistory = (
  conversationId: string
): Message[] | null => {
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

// Export helper functions for testing
export { createInitialWorkflowState, ensureAllNodesPresent, mergeNodesData };
