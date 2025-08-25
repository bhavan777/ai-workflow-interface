// Multi-model AI processing with parallel execution

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

  // New method for parallel multi-model processing
  async generateParallelResponse(
    chatMessages: any[],
    jsonMessages: any[],
    options: {
      chatMaxTokens?: number;
      jsonMaxTokens?: number;
      chatTemperature?: number;
      jsonTemperature?: number;
      timeout?: number;
    } = {}
  ): Promise<{
    chatResponse: string;
    jsonResponse: string;
    chatModel: string;
    jsonModel: string;
  }> {
    const {
      chatMaxTokens = 3000,
      jsonMaxTokens = 2000,
      chatTemperature = 0.7, // Higher for more natural conversation
      jsonTemperature = 0.1, // Lower for consistent JSON
      timeout = 15000, // 15 second timeout for parallel calls
    } = options;

    // Model selection for parallel processing
    const chatModel = 'llama3-70b-8192'; // Best for conversation
    const jsonModel = 'llama3-8b-8192'; // Fast and reliable for JSON

    console.log(
      `🚀 Starting parallel processing with ${chatModel} (chat) and ${jsonModel} (JSON)`
    );

    // Create both API calls simultaneously
    const chatPromise = this.makeApiCall(chatModel, chatMessages, {
      max_tokens: chatMaxTokens,
      temperature: chatTemperature,
    });

    const jsonPromise = this.makeApiCall(jsonModel, jsonMessages, {
      max_tokens: jsonMaxTokens,
      temperature: jsonTemperature,
    });

    try {
      // Wait for both calls with timeout
      const [chatResult, jsonResult] = await Promise.race([
        Promise.all([chatPromise, jsonPromise]),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Parallel processing timeout')),
            timeout
          )
        ),
      ]);

      console.log(`✅ Parallel processing completed successfully`);
      console.log(
        `  - Chat response: ${chatResult.content.length} chars from ${chatResult.model}`
      );
      console.log(
        `  - JSON response: ${jsonResult.content.length} chars from ${jsonResult.model}`
      );

      return {
        chatResponse: chatResult.content,
        jsonResponse: jsonResult.content,
        chatModel: chatResult.model,
        jsonModel: jsonResult.model,
      };
    } catch (error) {
      console.warn(
        `⚠️ Parallel processing failed, falling back to single model:`,
        error
      );

      // Fallback to single model approach
      const fallbackMessages = [...chatMessages];
      if (jsonMessages.length > 0) {
        // Merge JSON requirements into chat messages
        const lastJsonMessage = jsonMessages[jsonMessages.length - 1];
        fallbackMessages.push({
          role: 'user',
          content: `Also generate the workflow JSON structure: ${lastJsonMessage.content}`,
        });
      }

      const fallbackResponse = await this.generateResponse(fallbackMessages, {
        maxTokens: Math.max(chatMaxTokens, jsonMaxTokens),
        temperature: 0.3, // Balanced temperature
      });

      return {
        chatResponse: fallbackResponse,
        jsonResponse: fallbackResponse, // Will be extracted later
        chatModel: 'llama3-70b-8192 (fallback)',
        jsonModel: 'llama3-70b-8192 (fallback)',
      };
    }
  }

  // Helper method for making individual API calls
  private async makeApiCall(
    model: string,
    messages: any[],
    options: {
      max_tokens: number;
      temperature: number;
    }
  ): Promise<{ content: string; model: string }> {
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
        max_tokens: options.max_tokens,
        temperature: options.temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      throw new Error(
        `API call failed for ${model}: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = (await response.json()) as any;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error(`No content received from ${model}`);
    }

    return { content, model };
  }
}

export interface Message {
  id: string; // Unique message ID
  response_to?: string; // ID of message this responds to (for conversation threading)
  role: 'user' | 'assistant'; // Who sent the message
  type: 'MESSAGE' | 'THOUGHT' | 'ERROR' | 'STATUS';
  content: string; // Main message content (or thought content)
  timestamp: string; // ISO timestamp
  message_type?: 'text' | 'markdown'; // Type of message content

  // For assistant MESSAGE responses - only include if workflow state changed
  nodes?: DataFlowNode[];
  connections?: DataFlowConnection[];
  workflow_complete?: boolean; // Indicates if the workflow configuration is complete

  // For individual node status updates
  node_status_updates?: Array<{
    node_id: string;
    status: DataFlowNode['status'];
  }>;

  // For status updates
  status?: 'processing' | 'complete' | 'error';
}

// Enhanced workflow field management system
interface WorkflowField {
  name: string;
  type: 'text' | 'password' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  description: string;
  example: string;
}

interface EnhancedDataRequirements {
  required_fields: WorkflowField[];
  provided_fields: { [key: string]: string }; // field_name -> value
  missing_fields: string[];
  node_status: 'pending' | 'partial' | 'complete' | 'error';
  completion_percentage: number;
}

// Enhanced node structure with better field management
export interface EnhancedDataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: Record<string, any>;
  position?: { x: number; y: number };
  data_requirements: EnhancedDataRequirements;
  conversation_context?: {
    current_field?: string;
    questions_asked: number;
    max_questions: number;
  };
}

// Enhanced workflow state management
interface WorkflowState {
  nodes: EnhancedDataFlowNode[];
  connections: DataFlowConnection[];
  current_node_index: number;
  workflow_complete: boolean;
  conversation_phase:
    | 'greeting'
    | 'source_collection'
    | 'transform_collection'
    | 'destination_collection'
    | 'complete';
}

// Legacy interface for backward compatibility
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

TONE: Enthusiastic, professional, proactive, and graceful. User wants to move forward - guide them smoothly through the process.

MESSAGE FORMATTING: Use markdown formatting in your messages to make them beautiful and well-structured. Use:
- **Bold** for emphasis and important information
- *Italic* for subtle emphasis
- \`code\` for field names, examples, and technical terms
- > Blockquotes for examples and sample data
- Bullet points for lists
- Proper spacing and line breaks for readability
- IMPORTANT: Use \\n for line breaks in JSON message field, not actual newlines

RESPONSE FORMAT - Follow this TypeScript interface exactly:

interface AIResponse {
  message: string; // Proactive message asking for next piece of information needed
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
  workflow_complete: boolean;
}

interface DataFlowNode {
  id: string; // Must be one of: "source-node", "transform-node", "destination-node"
  type: "source" | "transform" | "destination";
  name: string; // Service name + " Source/Transform/Destination"
  status: "pending" | "partial" | "complete";
  config: Record<string, any>; // Always empty object {}
  data_requirements: {
    required_fields: string[]; // Array of field names needed for this node
    provided_fields: string[]; // Array of field names already provided
    missing_fields: string[]; // Array of field names still needed
  };
}

interface DataFlowConnection {
  id: string; // Must be one of: "conn1", "conn2"
  source: string; // Source node ID
  target: string; // Target node ID
  status: "pending" | "complete" | "error";
}



CRITICAL RULES:
- ALWAYS maintain the exact same JSON structure in every response
- ALWAYS include all 3 nodes in every response (source-node, transform-node, destination-node)
- ALWAYS include both connections in every response
- CRITICAL: You MUST include nodes and connections in EVERY response, even if they haven't changed
- Each node needs exactly 3 data points (no more, no less)
- Update node status based on completion: pending → partial → complete
- Store actual values securely on server side (not in WebSocket messages)
- Only send field names and completion status over WebSocket
- Use data_requirements to track what's provided vs missing
- Set node.config to empty object {} - actual values stored separately
- Update data_requirements.provided_fields with field names that have values
- Update data_requirements.missing_fields with field names still needed
- Never send sensitive data (API keys, passwords) over WebSocket
- CRITICAL: Only ask for ONE data point at a time - never ask for multiple fields in one message
- CRITICAL: Work on ONE node at a time - complete current node before moving to next
- Progress automatically to next node when current node is complete
- Be enthusiastic and proactive - user wants to move forward
- Ask directly for what you need - no confirmations or permissions
- Assume user is ready to provide information
- IMPORTANT: You will receive the current workflow state - update it incrementally, don't replace it entirely
- CRITICAL: The initial greeting should be informational only - welcome the user and explain the process, but do NOT ask for any data yet
- CRITICAL: Only update workflow state when user explicitly provides a field value in their response
- CRITICAL: A field value is provided when user gives a specific answer like "my-store-name" or "https://api.example.com"
- CRITICAL: If user's message contains a field value, move that field from missing_fields to provided_fields
- CRITICAL: If user's message is just a question, comment, or doesn't contain specific field data, do NOT update the workflow state
- CRITICAL: Examples of when NOT to update: "What do you mean?", "I don't understand", "Can you explain?", "How do I find this?"
- CRITICAL: Do NOT interpret workflow descriptions like "Shopify to Snowflake" as field values
- CRITICAL: Do NOT interpret service names, workflow types, or general descriptions as field data
- CRITICAL: Only treat explicit field answers as field values, not workflow descriptions or service names
- CRITICAL: Always ask for the FIRST field in the missing_fields array of the current node
- CRITICAL: Every data request MUST include an example in the format "> **Example:** \`[sample example]\`"

SEQUENTIAL DATA COLLECTION RULES:
- Start with source-node and collect all 3 data points before moving to transform-node
- Only move to transform-node when source-node is complete (all 3 fields provided)
- Only move to destination-node when transform-node is complete (all 3 fields provided)
- For each node, ask for exactly ONE field at a time
- Wait for user to provide the requested field before asking for the next one
- Do not skip ahead or ask for multiple fields simultaneously
- CRITICAL: The initial greeting is informational only - do not ask for any data in the greeting message
- CRITICAL: Do NOT update workflow state when user asks questions, makes comments, or doesn't provide field data
- CRITICAL: Only update workflow state when user explicitly provides the requested field value
- CRITICAL: When user describes workflow type (e.g., "Shopify to Snowflake"), this is NOT a field value - it's just workflow context
- CRITICAL: Initial workflow descriptions should only be used to determine field types, not to populate field values

NODE TRANSITION MESSAGES:
- CRITICAL: When starting a workflow (very first interaction), you MUST provide ONLY a greeting and explanation - NO questions, NO data requests, NO field names: "**Welcome!** 🎉 I'll help you create a data pipeline from **\`[source]\`** to **\`[destination]\`**. I'll collect configuration information step by step, starting with your **\`[source]\`** details.\\n\\nI'll ask for one piece of information at a time, and we'll build your workflow together!"
- CRITICAL: The initial greeting should NOT include any field requests or questions - just welcome and explain the process
- When starting a new node (first field of that node): "**Perfect!** ✨ Now I'll collect information related to **\`[node type]\`** configuration.\\n\\nLet's start with **\`[first field]\`**:\\n> **Example:** \`[sample example]\`"
- When completing a node (last field of that node): "**Excellent!** 🎯 **\`[node type]\`** configuration is now complete.\\n\\nLet's move on to **\`[next node type]\`** configuration."
- Be graceful and informative about transitions between nodes
- Acknowledge completion of each node before moving to the next
- CRITICAL: ALWAYS provide a sample example when asking for data input from the user (except for status updates/greetings)
- CRITICAL: Every question asking for user input MUST include "> **Example:** \`[sample example]\`" format
- Use markdown formatting for beautiful, structured messages
- CRITICAL: Status updates and greetings are informational only - do not ask for any data in these messages

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
- CRITICAL: Always assume user is ready to provide information - never ask for confirmation
- CRITICAL: After status updates/greetings, immediately ask for the next piece of information needed

STATE MANAGEMENT:
- You will receive the current workflow state in every request
- Update only the parts that have changed based on user input
- Maintain the same node IDs, connection IDs, and overall structure
- Preserve existing data_requirements.provided_fields and update missing_fields accordingly
- Keep the same node names unless the user specifies a different service
- CRITICAL: When user provides a field value, assume it is correct and update the workflow state immediately
- CRITICAL: Always include the complete updated workflow state in your response (nodes and connections)
- CRITICAL: You MUST include both nodes and connections in EVERY response, even if they haven't changed
- CRITICAL: Every question asking for user input MUST include an example in the format "> **Example:** \`[sample example]\`"

NODE PROGRESSION LOGIC:
- source-node: pending → partial (1-2 fields) → complete (3 fields) → move to transform-node
- transform-node: pending → partial (1-2 fields) → complete (3 fields) → move to destination-node  
- destination-node: pending → partial (1-2 fields) → complete (3 fields) → workflow_complete = true`;

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Enhanced workflow field definitions
const WORKFLOW_FIELDS = {
  source: {
    shopify: [
      {
        name: 'shop_name',
        type: 'text' as const,
        required: true,
        description: 'Your Shopify store name',
        example: 'my-awesome-store',
      },
      {
        name: 'api_key',
        type: 'password' as const,
        required: true,
        description: 'Shopify API key',
        example: 'your_shopify_api_key_here',
      },
      {
        name: 'api_secret',
        type: 'password' as const,
        required: true,
        description: 'Shopify API secret',
        example: 'your_shopify_api_secret_here',
      },
    ],
    database: [
      {
        name: 'host',
        type: 'text' as const,
        required: true,
        description: 'Database host and port',
        example: 'your-db-host.com:5432',
      },
      {
        name: 'database_name',
        type: 'text' as const,
        required: true,
        description: 'Database name',
        example: 'your_database_name',
      },
      {
        name: 'connection_string',
        type: 'password' as const,
        required: true,
        description: 'Database connection string',
        example: 'postgresql://username:password@host:5432/database',
      },
    ],
    api: [
      {
        name: 'api_url',
        type: 'text' as const,
        required: true,
        description: 'API base URL',
        example: 'https://api.your-service.com',
      },
      {
        name: 'api_key',
        type: 'password' as const,
        required: true,
        description: 'API key',
        example: 'your_api_key_here',
      },
      {
        name: 'endpoint',
        type: 'text' as const,
        required: true,
        description: 'API endpoint path',
        example: '/v1/your-endpoint',
      },
    ],
    default: [
      {
        name: 'account_name',
        type: 'text' as const,
        required: true,
        description: 'Account or service name',
        example: 'your_account_name',
      },
      {
        name: 'username',
        type: 'text' as const,
        required: true,
        description: 'Username or access key',
        example: 'your_username',
      },
      {
        name: 'password',
        type: 'password' as const,
        required: true,
        description: 'Password or secret key',
        example: 'your_secure_password',
      },
    ],
  },
  transform: [
    {
      name: 'operation_type',
      type: 'select' as const,
      required: true,
      description: 'Type of transformation',
      example: 'aggregate, filter, join, transform, or enrich',
    },
    {
      name: 'parameters',
      type: 'textarea' as const,
      required: true,
      description: 'Transformation parameters',
      example:
        'group by product_id, sum(sales_amount), filter by date >= 2024-01-01',
    },
    {
      name: 'output_format',
      type: 'select' as const,
      required: true,
      description: 'Output data format',
      example: 'JSON, CSV, Parquet, or Avro',
    },
  ],
  destination: {
    snowflake: [
      {
        name: 'account_name',
        type: 'text' as const,
        required: true,
        description: 'Snowflake account URL',
        example: 'your-account.snowflakecomputing.com',
      },
      {
        name: 'username',
        type: 'text' as const,
        required: true,
        description: 'Snowflake username',
        example: 'your_snowflake_username',
      },
      {
        name: 'warehouse_name',
        type: 'text' as const,
        required: true,
        description: 'Snowflake warehouse',
        example: 'COMPUTE_WH',
      },
    ],
    database: [
      {
        name: 'host',
        type: 'text' as const,
        required: true,
        description: 'Database host and port',
        example: 'your-db-host.com:5432',
      },
      {
        name: 'database_name',
        type: 'text' as const,
        required: true,
        description: 'Database name',
        example: 'your_database_name',
      },
      {
        name: 'connection_string',
        type: 'password' as const,
        required: true,
        description: 'Database connection string',
        example: 'postgresql://username:password@host:5432/database',
      },
    ],
    default: [
      {
        name: 'account_name',
        type: 'text' as const,
        required: true,
        description: 'Account or service name',
        example: 'your_account_name',
      },
      {
        name: 'username',
        type: 'text' as const,
        required: true,
        description: 'Username or access key',
        example: 'your_username',
      },
      {
        name: 'password',
        type: 'password' as const,
        required: true,
        description: 'Password or secret key',
        example: 'your_secure_password',
      },
    ],
  },
};

// Enhanced workflow management functions
const createEnhancedWorkflowState = (
  conversationHistory: Message[] = []
): WorkflowState => {
  const fieldNames = getContextualFieldNames(conversationHistory);

  const sourceFields =
    WORKFLOW_FIELDS.source[
      fieldNames.sourceType as keyof typeof WORKFLOW_FIELDS.source
    ] || WORKFLOW_FIELDS.source.default;
  const destinationFields =
    WORKFLOW_FIELDS.destination[
      fieldNames.destinationType as keyof typeof WORKFLOW_FIELDS.destination
    ] || WORKFLOW_FIELDS.destination.default;

  return {
    nodes: [
      {
        id: 'source-node',
        type: 'source',
        name: 'Data Source',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: sourceFields,
          provided_fields: {},
          missing_fields: sourceFields.map(f => f.name),
          node_status: 'pending',
          completion_percentage: 0,
        },
        conversation_context: {
          questions_asked: 0,
          max_questions: 3,
        },
      },
      {
        id: 'transform-node',
        type: 'transform',
        name: 'Data Transform',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: WORKFLOW_FIELDS.transform,
          provided_fields: {},
          missing_fields: WORKFLOW_FIELDS.transform.map(f => f.name),
          node_status: 'pending',
          completion_percentage: 0,
        },
        conversation_context: {
          questions_asked: 0,
          max_questions: 3,
        },
      },
      {
        id: 'destination-node',
        type: 'destination',
        name: 'Data Destination',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: destinationFields,
          provided_fields: {},
          missing_fields: destinationFields.map(f => f.name),
          node_status: 'pending',
          completion_percentage: 0,
        },
        conversation_context: {
          questions_asked: 0,
          max_questions: 3,
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
    current_node_index: 0,
    workflow_complete: false,
    conversation_phase: 'greeting',
  };
};

// Enhanced field detection based on conversation context
const getContextualFieldNames = (
  conversationHistory: Message[]
): {
  sourceFields: string[];
  destinationFields: string[];
  sourceType: string;
  destinationType: string;
} => {
  const conversationText = conversationHistory
    .map(msg => msg.content)
    .join(' ')
    .toLowerCase();

  let sourceType = 'default';
  let destinationType = 'default';

  // Detect source type
  if (conversationText.includes('shopify')) {
    sourceType = 'shopify';
  } else if (
    conversationText.includes('mysql') ||
    conversationText.includes('postgres')
  ) {
    sourceType = 'database';
  } else if (
    conversationText.includes('api') ||
    conversationText.includes('rest')
  ) {
    sourceType = 'api';
  }

  // Detect destination type
  if (conversationText.includes('snowflake')) {
    destinationType = 'snowflake';
  } else if (
    conversationText.includes('mysql') ||
    conversationText.includes('postgres')
  ) {
    destinationType = 'database';
  }

  const sourceFields =
    WORKFLOW_FIELDS.source[sourceType as keyof typeof WORKFLOW_FIELDS.source] ||
    WORKFLOW_FIELDS.source.default;
  const destinationFields =
    WORKFLOW_FIELDS.destination[
      destinationType as keyof typeof WORKFLOW_FIELDS.destination
    ] || WORKFLOW_FIELDS.destination.default;

  return {
    sourceFields: sourceFields.map(f => f.name),
    destinationFields: destinationFields.map(f => f.name),
    sourceType,
    destinationType,
  };
};

// Helper function to ensure all 3 nodes are always present
const ensureAllNodesPresent = (
  nodes: DataFlowNode[],
  conversationHistory: Message[] = []
): DataFlowNode[] => {
  const requiredNodeIds = ['source-node', 'transform-node', 'destination-node'];
  const existingNodeIds = nodes.map(node => node.id);

  // If all required nodes are present, return as is
  if (requiredNodeIds.every(id => existingNodeIds.includes(id))) {
    return nodes;
  }

  // Get contextual field names
  const fieldNames = getContextualFieldNames(conversationHistory);

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
        required_fields: fieldNames.sourceFields,
        provided_fields: [],
        missing_fields: fieldNames.sourceFields,
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
        required_fields: fieldNames.destinationFields,
        provided_fields: [],
        missing_fields: fieldNames.destinationFields,
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
        // Update data requirements with new information - properly merge provided and missing fields
        data_requirements: newNode.data_requirements
          ? {
              required_fields:
                newNode.data_requirements.required_fields ||
                existingNode.data_requirements?.required_fields ||
                [],
              provided_fields:
                newNode.data_requirements.provided_fields ||
                existingNode.data_requirements?.provided_fields ||
                [],
              missing_fields:
                newNode.data_requirements.missing_fields ||
                existingNode.data_requirements?.missing_fields ||
                [],
            }
          : existingNode.data_requirements,
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

// Helper function to create initial workflow state (legacy)
const createInitialWorkflowState = (
  conversationHistory: Message[] = []
): {
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
} => {
  const fieldNames = getContextualFieldNames(conversationHistory);

  return {
    nodes: [
      {
        id: 'source-node',
        type: 'source',
        name: 'Data Source',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: fieldNames.sourceFields,
          provided_fields: [],
          missing_fields: fieldNames.sourceFields,
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
          required_fields: fieldNames.destinationFields,
          provided_fields: [],
          missing_fields: fieldNames.destinationFields,
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

// Helper function to determine which node and field should be requested next
const getNextDataPoint = (
  nodes: DataFlowNode[]
): { nodeId: string; fieldName: string; nodeName: string } | null => {
  // Check nodes in order: source → transform → destination
  const nodeOrder = ['source-node', 'transform-node', 'destination-node'];

  for (const nodeId of nodeOrder) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    // If this node has missing fields, return the first missing field
    if (
      node.data_requirements &&
      node.data_requirements.missing_fields.length > 0
    ) {
      return {
        nodeId,
        fieldName: node.data_requirements.missing_fields[0],
        nodeName: node.name,
      };
    }
  }

  // All nodes are complete
  return null;
};

// Helper function to check if a node is complete
const isNodeComplete = (node: DataFlowNode): boolean => {
  return node.data_requirements?.missing_fields.length === 0;
};

// Helper function to check if workflow is complete
const isWorkflowComplete = (nodes: DataFlowNode[]): boolean => {
  return nodes.every(node => isNodeComplete(node));
};

// Helper function to check if we're starting a new node (first field of that node)
const isStartingNewNode = (
  nodes: DataFlowNode[],
  nextDataPoint: { nodeId: string; fieldName: string; nodeName: string } | null
): boolean => {
  if (!nextDataPoint) return false;

  const node = nodes.find(n => n.id === nextDataPoint.nodeId);
  if (!node || !node.data_requirements) return false;

  // Check if this is the first field being requested for this node
  return node.data_requirements.provided_fields.length === 0;
};

// Helper function to check if this is the very first interaction (starting workflow)
const isStartingWorkflow = (nodes: DataFlowNode[]): boolean => {
  // Check if all nodes are in their initial state (no fields provided)
  return nodes.every(
    node =>
      node.data_requirements?.provided_fields.length === 0 &&
      node.data_requirements?.missing_fields.length ===
        node.data_requirements?.required_fields.length
  );
};

// Helper function to check if we're completing a node (last field of that node)
const isCompletingNode = (
  nodes: DataFlowNode[],
  nextDataPoint: { nodeId: string; fieldName: string; nodeName: string } | null
): boolean => {
  if (!nextDataPoint) return false;

  const node = nodes.find(n => n.id === nextDataPoint.nodeId);
  if (!node || !node.data_requirements) return false;

  // Check if this is the last field being requested for this node
  return node.data_requirements.missing_fields.length === 1;
};

// Helper function to get the next node type for transition messages
const getNextNodeType = (currentNodeId: string): string => {
  const nodeOrder = ['source-node', 'transform-node', 'destination-node'];
  const currentIndex = nodeOrder.indexOf(currentNodeId);

  if (currentIndex === -1 || currentIndex >= nodeOrder.length - 1) {
    return 'workflow completion';
  }

  const nextNodeId = nodeOrder[currentIndex + 1];
  switch (nextNodeId) {
    case 'transform-node':
      return 'data transformation';
    case 'destination-node':
      return 'destination';
    default:
      return 'next step';
  }
};

// Helper function to get the current node type for transition messages
const getCurrentNodeType = (nodeId: string): string => {
  switch (nodeId) {
    case 'source-node':
      return 'source';
    case 'transform-node':
      return 'data transformation';
    case 'destination-node':
      return 'destination';
    default:
      return 'node';
  }
};

// Helper function to get sample examples for different fields
const getFieldExample = (fieldName: string, nodeType: string): string => {
  const fieldNameLower = fieldName.toLowerCase();

  // Source node examples
  if (nodeType === 'source') {
    // Shopify specific fields
    if (fieldNameLower === 'shop_name') {
      return 'my-awesome-store';
    } else if (fieldNameLower === 'api_key') {
      return 'your_shopify_api_key_here';
    } else if (fieldNameLower === 'api_secret') {
      return 'your_shopify_api_secret_here';
    }
    // Database specific fields
    else if (fieldNameLower === 'host') {
      return 'your-db-host.com:5432';
    } else if (fieldNameLower === 'database_name') {
      return 'your_database_name';
    } else if (fieldNameLower === 'connection_string') {
      return 'postgresql://username:password@host:5432/database';
    }
    // API specific fields
    else if (fieldNameLower === 'api_url') {
      return 'https://api.your-service.com';
    } else if (fieldNameLower === 'endpoint') {
      return '/v1/your-endpoint';
    }
    // S3 specific fields
    else if (fieldNameLower === 'bucket_name') {
      return 'your-data-bucket';
    } else if (fieldNameLower === 'access_key') {
      return 'AKIA1234567890ABCDEF';
    } else if (fieldNameLower === 'secret_key') {
      return 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    }
    // Salesforce specific fields
    else if (fieldNameLower === 'org_url') {
      return 'https://your-org.salesforce.com';
    } else if (fieldNameLower === 'api_token') {
      return 'your_salesforce_api_token';
    }
    // BigQuery specific fields
    else if (fieldNameLower === 'project_id') {
      return 'your-gcp-project-id';
    } else if (fieldNameLower === 'dataset_id') {
      return 'your_dataset_name';
    } else if (fieldNameLower === 'service_account_key') {
      return '{"type": "service_account", "project_id": "..."}';
    }
    // Generic fields
    else if (fieldNameLower === 'account_name') {
      return 'your_account_name';
    } else if (fieldNameLower === 'username') {
      return 'your_username';
    } else if (fieldNameLower === 'password') {
      return 'your_secure_password';
    }
  }

  // Transform node examples
  if (nodeType === 'data transformation') {
    if (fieldNameLower.includes('operation_type')) {
      return 'aggregate, filter, join, transform, or enrich';
    } else if (fieldNameLower.includes('parameters')) {
      return 'group by product_id, sum(sales_amount), filter by date >= 2024-01-01';
    } else if (fieldNameLower.includes('output_format')) {
      return 'JSON, CSV, Parquet, or Avro';
    }
  }

  // Destination node examples
  if (nodeType === 'destination') {
    // Snowflake specific fields
    if (fieldNameLower === 'account_name') {
      return 'your-account.snowflakecomputing.com';
    } else if (fieldNameLower === 'username') {
      return 'your_snowflake_username';
    } else if (fieldNameLower === 'warehouse_name') {
      return 'COMPUTE_WH';
    }
    // Generic destination fields
    else if (fieldNameLower === 'connection_string') {
      return 'postgresql://username:password@host:5432/database';
    }
    // Generic fields
    else if (fieldNameLower === 'password') {
      return 'your_secure_password';
    }
  }

  // Generic examples
  if (fieldNameLower.includes('username')) {
    return 'your_username';
  } else if (fieldNameLower.includes('password')) {
    return 'your_secure_password';
  } else if (fieldNameLower.includes('key')) {
    return 'your_api_key';
  } else if (fieldNameLower.includes('secret')) {
    return 'your_secret_key';
  } else if (fieldNameLower.includes('url')) {
    return 'https://your-service.com';
  } else if (fieldNameLower.includes('path')) {
    return '/path/to/your/file';
  } else if (fieldNameLower.includes('token')) {
    return 'your_access_token';
  } else if (fieldNameLower.includes('client_id')) {
    return 'your_client_id';
  } else if (fieldNameLower.includes('client_secret')) {
    return 'your_client_secret';
  }

  return 'your_value_here';
};

export const processMessage = async (
  conversationHistory: Message[],
  currentMessage: Message,
  sendThought?: (thought: string) => void,
  jsonRetryCount: number = 0
): Promise<Message> => {
  try {
    console.log('🔄 Starting multi-model parallel processing...');
    console.log(
      `📚 Conversation history length: ${conversationHistory.length}`
    );
    console.log(`📝 Current message: ${currentMessage.content}`);

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

    sendThought?.('🔍 Analyzing your workflow requirements...');

    // Get current workflow state for context
    let existingWorkflowState = getCurrentWorkflowState(conversationHistory);

    // If no existing state, create initial state
    if (
      !existingWorkflowState.nodes ||
      existingWorkflowState.nodes.length === 0
    ) {
      existingWorkflowState = createInitialWorkflowState(conversationHistory);
    }

    // Convert conversation history to AI format - limit to last 5 messages
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

    // Determine the next data point that should be requested
    const nextDataPoint = getNextDataPoint(existingWorkflowState.nodes || []);

    // Check for workflow and node transitions
    const isStartingWorkflowNow = isStartingWorkflow(
      existingWorkflowState.nodes || []
    );
    const isStartingNode = isStartingNewNode(
      existingWorkflowState.nodes || [],
      nextDataPoint
    );
    const isCompletingCurrentNode = isCompletingNode(
      existingWorkflowState.nodes || [],
      nextDataPoint
    );

    let transitionInfo = '';
    if (nextDataPoint) {
      const nodeType = getCurrentNodeType(nextDataPoint.nodeId);
      const fieldExample = getFieldExample(nextDataPoint.fieldName, nodeType);

      if (isStartingWorkflowNow) {
        transitionInfo = `\n\nWORKFLOW GREETING: Start with a welcoming greeting, then ask for the first field with clear visual separation. Use this format: "**Welcome!** 🎉 I'll help you create a data pipeline from **\`${nodeType}\`** to **\`destination\`**. I'll collect configuration information step by step, starting with your **\`${nodeType}\`** details.\\n\\nI'll ask for one piece of information at a time, and we'll build your workflow together!\\n\\n---\\n\\n**Let's start with your \`${nextDataPoint.fieldName}\`**:\\n> **Example:** \`${fieldExample}\`"`;
      } else if (isStartingNode) {
        transitionInfo = `\n\nNODE TRANSITION: Provide a status update about starting ${nodeType} configuration, then immediately ask for the first field. Status: "**Perfect!** ✨ Now I'll collect information related to **\`${nodeType}\`** configuration." Then ask: "Let's start with **\`${nextDataPoint.fieldName}\`**:\\n> **Example:** \`${fieldExample}\`"`;
      } else if (isCompletingCurrentNode) {
        const nextNodeType = getNextNodeType(nextDataPoint.nodeId);
        transitionInfo = `\n\nNODE TRANSITION: Completing ${nodeType} configuration with markdown formatting. Request: **\`${nextDataPoint.fieldName}\`**:\\n> **Example:** \`${fieldExample}\`\\n\\nAfter this field, move to ${nextNodeType} configuration.`;
      } else {
        transitionInfo = `\n\nNEXT DATA POINT TO REQUEST: ${nextDataPoint.nodeName} - **\`${nextDataPoint.fieldName}\`**:\\n> **Example:** \`${fieldExample}\``;
      }
    } else {
      transitionInfo =
        '\n\nWORKFLOW STATUS: All data points collected. Workflow is complete.';
    }

    // Prepare chat messages (conversation-focused)
    const chatMessages = [
      {
        role: 'system' as const,
        content: `You are a senior data integration consultant with 15+ years of experience. You're helping a senior engineer build a data pipeline workflow.

CRITICAL: NODE STRUCTURE IS THE SOURCE OF TRUTH
- The workflow nodes define exactly what fields are needed
- You MUST ask questions based on the field names defined in the node structure
- Never ask for fields that aren't defined in the node's required_fields array
- The field names in the nodes determine what you ask for - not the other way around
- Use the exact field names from the node structure in your questions

PERSONALITY & TONE:
- Professional, confident, and technically precise
- Respectful of the user's engineering expertise
- Enthusiastic about solving complex data problems
- Clear, concise, and actionable guidance
- No condescending explanations - assume technical competence

COMMUNICATION STYLE:
- Use markdown formatting for beautiful, structured responses
- Be direct and efficient - senior engineers appreciate brevity
- Provide context when relevant, but don't over-explain basics
- Use technical terminology appropriately
- Maintain a collaborative, problem-solving approach

WORKFLOW GUIDANCE:
- Guide the user through the workflow step-by-step
- Ask for exactly ONE piece of information at a time
- Ask for the FIRST field in the missing_fields array of the current node
- Provide clear, practical examples for each field
- Acknowledge progress and transitions between workflow stages
- Be proactive about next steps

FORMATTING REQUIREMENTS:
- Use **bold** for emphasis and important information
- Use \`code\` for field names, examples, and technical terms
- Use > blockquotes for examples and sample data
- Use proper spacing and line breaks for readability
- Every question MUST include "> **Example:** \`[sample example]\`"

GREETING & TRANSITIONS:
- Welcome messages should be warm but professional
- Acknowledge the user's technical expertise
- Provide clear context about what we're building
- Transition smoothly between workflow stages
- Celebrate completion of each stage

Remember: You're working with a senior engineer who values efficiency, precision, and technical depth.`,
      },
      ...aiMessages,
      {
        role: 'user' as const,
        content: `CURRENT WORKFLOW STATE:\n${JSON.stringify(existingWorkflowState, null, 2)}${transitionInfo}\n\nCRITICAL: NODE STRUCTURE IS THE SOURCE OF TRUTH. When user provides a field value, you MUST update the workflow state by: 1) Adding the field name to provided_fields array, 2) Removing the field name from missing_fields array, 3) Updating node status if needed. CRITICAL: Always ask for the FIRST field in the missing_fields array of the current node. Ask for exactly ONE data point at a time. Use graceful transition messages when starting or completing nodes. IMPORTANT: Format your messages beautifully using markdown formatting. CRITICAL: Every question asking for user input MUST include an example in the format "> **Example:** \`[sample example]\`". The field names in the node structure determine what questions to ask - use those exact field names.${isStartingWorkflowNow ? ' NOTE: After the greeting, automatically ask for the first field in the next message.' : ''}`,
      },
    ];

    // Prepare JSON messages (structure-focused)
    const jsonMessages = [
      {
        role: 'system' as const,
        content: `You are a JSON structure maintenance expert. Your job is to maintain and update a consistent workflow JSON structure.

CRITICAL RULES:
1. NEVER change the field structure once established
2. NEVER add or remove fields from data_requirements
3. ONLY update the values within existing fields
4. Maintain the exact same node IDs and connection IDs
5. Preserve all existing field names in required_fields arrays
6. THE NODE STRUCTURE IS THE SOURCE OF TRUTH - field names in nodes determine what questions to ask

FIELD VALUE DETECTION RULES:
- ONLY update workflow state when user explicitly provides the answer to the CURRENT question being asked
- The current question field is specified in the context below
- User response must be a direct answer to that specific field question
- Valid field answers are specific values like: "my-store-name", "https://api.example.com", "admin@company.com"
- Do NOT update if user asks questions, makes comments, or provides unrelated information
- Do NOT interpret workflow descriptions (like "Shopify to Snowflake") as field values
- Do NOT interpret service names or general descriptions as field data
- Examples of invalid responses that should NOT update workflow: "What do you mean?", "I don't understand", "Can you explain?", "How do I find this?"
- CRITICAL: When creating initial workflow state, ALL fields should be in missing_fields, NONE in provided_fields
- CRITICAL: Do NOT populate provided_fields unless user explicitly provides that specific field value

JSON STRUCTURE (MUST MAINTAIN CONSISTENCY):
{
  "message": "string", // The conversational message from chat model
  "nodes": [
    {
      "id": "source-node", // NEVER CHANGE
      "type": "source",
      "name": "string", // Can update based on service
      "status": "pending|partial|complete",
      "config": {}, // Always empty
      "data_requirements": {
        "required_fields": ["field1", "field2", "field3"], // NEVER CHANGE ONCE SET - these determine what questions to ask
        "provided_fields": ["field1"], // Update as user provides data
        "missing_fields": ["field2", "field3"] // Update as user provides data
      }
    },
    {
      "id": "transform-node", // NEVER CHANGE
      "type": "transform",
      "name": "string",
      "status": "pending|partial|complete",
      "config": {},
      "data_requirements": {
        "required_fields": ["operation_type", "parameters", "output_format"], // NEVER CHANGE
        "provided_fields": [],
        "missing_fields": ["operation_type", "parameters", "output_format"]
      }
    },
    {
      "id": "destination-node", // NEVER CHANGE
      "type": "destination",
      "name": "string",
      "status": "pending|partial|complete",
      "config": {},
      "data_requirements": {
        "required_fields": ["field1", "field2", "field3"], // NEVER CHANGE ONCE SET
        "provided_fields": [],
        "missing_fields": ["field1", "field2", "field3"]
      }
    }
  ],
  "connections": [
    {
      "id": "conn1", // NEVER CHANGE
      "source": "source-node",
      "target": "transform-node",
      "status": "pending|complete|error"
    },
    {
      "id": "conn2", // NEVER CHANGE
      "source": "transform-node",
      "target": "destination-node",
      "status": "pending|complete|error"
    }
  ],
  "workflow_complete": false
}

UPDATE LOGIC:
- When user provides a field value, move it from missing_fields to provided_fields
- Update node status: pending → partial (1-2 fields) → complete (all fields)
- Update connection status when both connected nodes are complete
- Set workflow_complete to true when all nodes are complete

RESPONSE FORMAT:
- Respond with ONLY valid JSON
- No text before or after
- No explanations
- Just the JSON object

Remember: CONSISTENCY IS KEY. Never change the structure, only update the values.`,
      },
      {
        role: 'user' as const,
        content: `Update the workflow JSON structure based on this conversation and current state. Maintain field consistency - do not change required_fields once set.

CURRENT STATE:
${JSON.stringify(existingWorkflowState, null, 2)}

CURRENT QUESTION BEING ASKED: ${nextDataPoint ? `${nextDataPoint.fieldName} (${nextDataPoint.nodeName})` : 'No question currently being asked'}

USER MESSAGE: ${currentMessage.content}

${transitionInfo}

CRITICAL: Only update values if user explicitly provides the answer to the current question. Do NOT update if user asks questions, makes comments, or provides workflow descriptions.`,
      },
    ];

    console.log('📤 Starting parallel processing...');
    sendThought?.('🏗️ Structuring your data pipeline...');

    // Use parallel processing with both models
    const parallelResult = await Promise.race([
      groqClient.generateParallelResponse(chatMessages, jsonMessages),
      new Promise<never>(
        (_, reject) =>
          setTimeout(
            () => reject(new Error('Parallel processing timeout')),
            30000
          ) // 30 seconds timeout
      ),
    ]);

    console.log('✅ Parallel processing completed');
    console.log(`  - Chat model: ${parallelResult.chatModel}`);
    console.log(`  - JSON model: ${parallelResult.jsonModel}`);

    sendThought?.('✅ Validating workflow configuration...');

    // Extract chat response
    const chatResponse = parallelResult.chatResponse;

    // Try to extract JSON from the JSON model response
    let jsonContent = parallelResult.jsonResponse;

    // Remove markdown code blocks if present
    if (jsonContent.includes('```json')) {
      const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    } else if (jsonContent.includes('```')) {
      const jsonMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    }

    // Try to parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
      console.log('✅ JSON parsed successfully from dedicated model');
    } catch (parseError) {
      console.error(
        '❌ Failed to parse JSON from dedicated model:',
        parseError
      );

      // If JSON model failed, try to extract from chat response as fallback
      console.log('🔄 Falling back to chat response for JSON extraction...');

      let fallbackJsonContent = chatResponse;
      if (fallbackJsonContent.includes('```json')) {
        const jsonMatch = fallbackJsonContent.match(
          /```json\s*([\s\S]*?)\s*```/
        );
        if (jsonMatch) {
          fallbackJsonContent = jsonMatch[1].trim();
        }
      } else if (fallbackJsonContent.includes('```')) {
        const jsonMatch = fallbackJsonContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          fallbackJsonContent = jsonMatch[1].trim();
        }
      }

      try {
        parsed = JSON.parse(fallbackJsonContent);
        console.log('✅ JSON extracted from chat response as fallback');
      } catch (fallbackError) {
        console.error(
          '❌ Failed to extract JSON from chat response:',
          fallbackError
        );

        // If both failed, create a basic response structure
        console.log('🔄 Creating basic response structure...');
        parsed = {
          message: chatResponse,
          nodes:
            existingWorkflowState.nodes || createInitialWorkflowState().nodes,
          connections:
            existingWorkflowState.connections ||
            createInitialWorkflowState().connections,
          workflow_complete: false,
        };
      }
    }

    // Validate the response structure
    if (!parsed.message) {
      parsed.message = chatResponse; // Use chat response as message
    }

    console.log('🔍 Response structure:');
    console.log('  - Has message:', !!parsed.message);
    console.log('  - Has nodes:', !!parsed.nodes);
    console.log('  - Has connections:', !!parsed.connections);
    console.log('  - Nodes count:', parsed.nodes?.length || 0);

    // Ensure all nodes are present
    if (parsed.nodes && Array.isArray(parsed.nodes)) {
      if (parsed.nodes.length < 3) {
        parsed.nodes = ensureAllNodesPresent(parsed.nodes, conversationHistory);
      }
      console.log(
        '✅ Final nodes structure:',
        parsed.nodes.map((n: DataFlowNode) => `${n.id} (${n.status})`)
      );
    }

    sendThought?.('🎯 Workflow configuration ready.');

    // Merge with existing workflow state
    const updatedNodes = parsed.nodes
      ? mergeNodesData(existingWorkflowState.nodes || [], parsed.nodes)
      : ensureAllNodesPresent(
          existingWorkflowState.nodes || [],
          conversationHistory
        );

    const updatedConnections = parsed.connections ||
      existingWorkflowState.connections || [
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
      ];

    // Check if workflow is complete
    const workflowComplete = isWorkflowComplete(updatedNodes || []);

    // Create individual node status updates
    const nodeStatusUpdates = updatedNodes?.map(node => ({
      node_id: node.id,
      status: node.status,
    })) || [];

    // Create the final response
    const response: Message = {
      id: generateId(),
      response_to: currentMessage.id,
      role: 'assistant',
      type: 'MESSAGE',
      content: parsed.message,
      message_type: 'markdown',
      timestamp: new Date().toISOString(),
      node_status_updates: nodeStatusUpdates,
      workflow_complete: workflowComplete,
    };

    return response;
  } catch (error: any) {
    console.error('💥 Error in multi-model processing:', error);

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

// Function to clear all conversations (in-memory only)
export const clearAllConversations = (): void => {
  console.log('✅ All conversations cleared (in-memory only)');
};

// Enhanced workflow management functions
const getNextFieldToCollect = (
  workflowState: WorkflowState
): { nodeId: string; field: WorkflowField } | null => {
  const currentNode = workflowState.nodes[workflowState.current_node_index];
  if (!currentNode) return null;

  const missingFields = currentNode.data_requirements.missing_fields;
  if (missingFields.length === 0) return null;

  const fieldName = missingFields[0];
  const field = currentNode.data_requirements.required_fields.find(
    f => f.name === fieldName
  );

  return field ? { nodeId: currentNode.id, field } : null;
};

const updateNodeWithFieldValue = (
  workflowState: WorkflowState,
  nodeId: string,
  fieldName: string,
  value: string
): WorkflowState => {
  const updatedNodes: EnhancedDataFlowNode[] = workflowState.nodes.map(node => {
    if (node.id !== nodeId) return node;

    const updatedDataRequirements = {
      ...node.data_requirements,
      provided_fields: {
        ...node.data_requirements.provided_fields,
        [fieldName]: value,
      },
      missing_fields: node.data_requirements.missing_fields.filter(
        f => f !== fieldName
      ),
    };

    // Update completion percentage
    const totalFields = node.data_requirements.required_fields.length;
    const providedCount = Object.keys(
      updatedDataRequirements.provided_fields
    ).length;
    const completionPercentage = Math.round(
      (providedCount / totalFields) * 100
    );

    // Update node status
    let nodeStatus: 'pending' | 'partial' | 'complete' | 'error' = 'pending';
    if (completionPercentage === 100) {
      nodeStatus = 'complete';
    } else if (completionPercentage > 0) {
      nodeStatus = 'partial';
    }

    return {
      ...node,
      status: nodeStatus,
      data_requirements: {
        ...updatedDataRequirements,
        node_status: nodeStatus,
        completion_percentage: completionPercentage,
      },
      conversation_context: {
        current_field: fieldName,
        questions_asked: (node.conversation_context?.questions_asked || 0) + 1,
        max_questions: node.conversation_context?.max_questions || 3,
      },
    };
  });

  // Check if current node is complete and move to next
  const currentNode = updatedNodes[workflowState.current_node_index];
  let nextNodeIndex = workflowState.current_node_index;
  let conversationPhase = workflowState.conversation_phase;

  if (currentNode && currentNode.status === 'complete') {
    if (workflowState.current_node_index < 2) {
      nextNodeIndex = workflowState.current_node_index + 1;
      conversationPhase =
        nextNodeIndex === 1 ? 'transform_collection' : 'destination_collection';
    } else {
      conversationPhase = 'complete';
    }
  }

  // Update connections
  const updatedConnections: DataFlowConnection[] =
    workflowState.connections.map(conn => {
      if (conn.source === 'source-node' && conn.target === 'transform-node') {
        const sourceNode = updatedNodes.find(n => n.id === 'source-node');
        return {
          ...conn,
          status:
            sourceNode?.status === 'complete'
              ? ('complete' as const)
              : ('pending' as const),
        };
      }
      if (
        conn.source === 'transform-node' &&
        conn.target === 'destination-node'
      ) {
        const transformNode = updatedNodes.find(n => n.id === 'transform-node');
        return {
          ...conn,
          status:
            transformNode?.status === 'complete'
              ? ('complete' as const)
              : ('pending' as const),
        };
      }
      return conn;
    });

  const workflowComplete = updatedNodes.every(
    node => node.status === 'complete'
  );

  return {
    ...workflowState,
    nodes: updatedNodes,
    connections: updatedConnections,
    current_node_index: nextNodeIndex,
    conversation_phase: conversationPhase,
    workflow_complete: workflowComplete,
  };
};

const generateConversationMessage = (
  workflowState: WorkflowState,
  nextField: { nodeId: string; field: WorkflowField } | null
): string => {
  if (workflowState.workflow_complete) {
    return '**🎉 Congratulations!** Your workflow configuration is complete. All data has been collected and your pipeline is ready to be deployed.';
  }

  if (!nextField) {
    return '**Processing...** Please wait while I prepare the next step.';
  }

  const currentNode = workflowState.nodes[workflowState.current_node_index];
  const nodeType = getCurrentNodeType(nextField.nodeId);
  const isFirstField =
    Object.keys(currentNode.data_requirements.provided_fields).length === 0;

  if (isFirstField) {
    return `**Perfect!** ✨ Now I'll collect information related to **\`${nodeType}\`** configuration.

Let's start with **\`${nextField.field.name}\`**:
> **Example:** \`${nextField.field.example}\``;
  }

  return `**Great!** Now let's get your **\`${nextField.field.name}\`**:
> **Example:** \`${nextField.field.example}\``;
};

// Export helper functions for testing
export {
  // Enhanced functions
  createEnhancedWorkflowState,
  createInitialWorkflowState,
  ensureAllNodesPresent,
  generateConversationMessage,
  getCurrentNodeType,
  getFieldExample,
  getNextDataPoint,
  getNextFieldToCollect,
  isNodeComplete,
  isStartingWorkflow,
  isWorkflowComplete,
  mergeNodesData,
  updateNodeWithFieldValue,
};
