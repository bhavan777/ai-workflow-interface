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
      temperature = 0.7,
      speed = 'balanced',
      cost = 'medium',
    } = options;

    // Define available models in order of preference - prioritize cheaper/faster models
    const availableModels = [
      'llama3-8b-8192', // Fast, good for simple tasks, cheaper
      'gemma2-9b-it', // Alternative model for fallback
      'llama3-70b-8192', // High quality, use only if needed
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

const SYSTEM_PROMPT = `You are a data integration expert helping users build data pipelines through conversation.

CRITICAL: You MUST respond with ONLY a valid JSON object. No text before or after the JSON. No explanations. Just the JSON.

CRITICAL WORKFLOW REQUIREMENTS:
- ALWAYS create exactly 3 nodes: 1 source, 1 transform, 1 destination
- ALWAYS include ALL 3 nodes in EVERY response, even if not being configured
- NEVER omit any of the 3 nodes from the response
- Each node must have unique IDs: "source-node", "transform-node", "destination-node"

CRITICAL UPDATE RULES:
- You will receive the CURRENT WORKFLOW STATE with each message
- ONLY update fields that are changing based on user input
- DO NOT change any existing fields unless user provided new information
- Preserve all existing node configuration and data
- Only update: status, config (add new fields), data_requirements (move fields from missing to provided)
- DO NOT recreate or restructure nodes

CRITICAL VALIDATION RULES:
- NEVER validate user input - accept whatever they provide as correct
- Do NOT ask for corrections or better formats
- Assume all user input is valid and proceed with configuration
- If user provides sample data that looks realistic, accept it immediately
- Do NOT check if URLs, API keys, or other data actually exist in real world
- Focus on collecting information, not validating it
- Accept any input that could be real data and move to next question

RESPONSE FORMAT - COPY THIS EXACTLY (NEVER CHANGE THE STRUCTURE):
{
  "message": "Thank you for that information! Now I need to know: [next single question]",
  "nodes": [
    {
      "id": "source-node",
      "type": "source", 
      "name": "[Source Name]",
      "status": "pending|partial|complete",
      "config": {},
      "data_requirements": {
        "required_fields": [],
        "provided_fields": [],
        "missing_fields": []
      }
    },
    {
      "id": "transform-node",
      "type": "transform",
      "name": "Data Transform", 
      "status": "pending",
      "config": {},
      "data_requirements": {
        "required_fields": [],
        "provided_fields": [],
        "missing_fields": []
      }
    },
    {
      "id": "destination-node",
      "type": "destination",
      "name": "[Destination Name]",
      "status": "pending", 
      "config": {},
      "data_requirements": {
        "required_fields": [],
        "provided_fields": [],
        "missing_fields": []
      }
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "source": "source-node",
      "target": "transform-node",
      "status": "pending"
    },
    {
      "id": "conn2", 
      "source": "transform-node",
      "target": "destination-node",
      "status": "pending"
    }
  ],
  "workflow_complete": false
}

WHEN ALL NODES ARE COMPLETE, USE THIS FORMAT:
{
  "message": "🎉 Perfect! Your data pipeline configuration is complete. All nodes are configured and ready to go. You can now start your workflow!",
  "nodes": [
    {
      "id": "source-node",
      "type": "source", 
      "name": "[Source Name]",
      "status": "complete",
      "config": { "field1": "provided_value", "field2": "provided_value" },
      "data_requirements": {
        "required_fields": ["field1", "field2"],
        "provided_fields": ["field1", "field2"],
        "missing_fields": []
      }
    },
    {
      "id": "transform-node",
      "type": "transform",
      "name": "Data Transform", 
      "status": "complete",
      "config": { "type": "provided_value" },
      "data_requirements": {
        "required_fields": ["operation_type"],
        "provided_fields": ["operation_type"],
        "missing_fields": []
      }
    },
    {
      "id": "destination-node",
      "type": "destination",
      "name": "[Destination Name]",
      "status": "complete", 
      "config": { "field1": "provided_value", "field2": "provided_value" },
      "data_requirements": {
        "required_fields": ["field1", "field2"],
        "provided_fields": ["field1", "field2"],
        "missing_fields": []
      }
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "source": "source-node",
      "target": "transform-node",
      "status": "complete"
    },
    {
      "id": "conn2", 
      "source": "transform-node",
      "target": "destination-node",
      "status": "complete"
    }
  ],
  "workflow_complete": true
}

RULES:
1. ALWAYS respond with ONLY valid JSON - no other text
2. ALWAYS ask only ONE question at a time
3. CRITICAL: Follow EXACT order: source → transform → destination (never skip or change order)
4. CRITICAL: Complete ALL questions for ONE node before moving to the next node
5. Update node status: "pending" → "partial" → "complete" based on provided info
6. ALWAYS update node config with each piece of information provided
7. Thank user for each piece of information provided
8. Ask the next single question needed with a clear example
9. Set node status to "complete" when all required fields for that node are provided
10. ALWAYS include data_requirements for each node with:
    - required_fields: Array of all fields needed for this node type
    - provided_fields: Array of fields that have been provided
    - missing_fields: Array of fields still needed (required_fields - provided_fields)
11. Update data_requirements whenever user provides new information
12. CRITICAL: NODE PERSISTENCE - Only provide fields that are changing or being added to existing nodes
13. CRITICAL: Do NOT recreate nodes from scratch - preserve existing configuration
14. CRITICAL: When updating a node, only include the specific fields being updated (name, status, config, data_requirements)
15. CRITICAL: For nodes not being updated, include only the essential fields (id, type, name, status)
16. CRITICAL: NEVER validate user input - accept whatever they provide as correct
17. CRITICAL: Do NOT ask for corrections or better formats
18. CRITICAL: Assume all user input is valid and proceed with configuration
19. CRITICAL: If user provides sample data that looks realistic, accept it immediately
20. CRITICAL: Do NOT check if URLs, API keys, or other data actually exist in real world
21. CRITICAL: Focus on collecting information, not validating it
22. CRITICAL: Accept any input that could be real data and move to next question
12. A node is "complete" when missing_fields is empty
13. A node is "partial" when some but not all required fields are provided
14. A node is "pending" when no required fields are provided
15. CRITICAL: ALWAYS include ALL 3 nodes (source-node, transform-node, destination-node) in EVERY response
16. CRITICAL: NEVER omit any of the 3 nodes, even if they are not being configured yet
17. CRITICAL: If a node is not being configured, keep it with "pending" status and empty config
18. When all nodes are "complete", set "workflow_complete": true and provide success message
19. NEVER ask for information that has already been provided
20. ALWAYS check conversation history to see what information is already available
21. If user provides information for a different step, acknowledge it and continue with the current step
22. If user asks about options, provide them clearly and ask for their choice
23. ACCEPT ALL user input - NO VALIDATION - assume everything provided is correct
24. ALWAYS provide a clear example in each question (e.g., "What's your database name? For example: my_shopify_db")
25. Be flexible with input formats - accept variations and common formats
26. DYNAMICALLY determine source and destination based on user's request
27. Ask relevant questions for the specific source/destination combination
28. ALWAYS include the current node configuration in your response
29. CRITICAL: Maximum 3 questions per node - if more fields needed, prioritize the most important 3
30. NEVER validate user input - accept whatever they provide as correct
31. CRITICAL: Only move to next node when current node is "complete" (all required fields provided)

NO VALIDATION RULES:
- ACCEPT ALL user input without any validation
- Assume everything the user provides is correct
- Never reject or question user input
- Focus on collecting information efficiently
- Provide clear examples in questions to guide users

COMMON SOURCE/DESTINATION CONFIGURATIONS:

**Salesforce:**
- Required fields: instance_url, username, password/access_token
- URL format: https://yourdomain.my.salesforce.com

**Shopify:**
- Required fields: store_url, api_key
- URL format: https://mystore.myshopify.com

**Mailchimp:**
- Required fields: api_key, datacenter
- API key format: any non-empty string

**Snowflake:**
- Required fields: account_url, username, password/private_key
- URL format: https://your-account.snowflakecomputing.com

**Google Analytics:**
- Required fields: property_id, service_account_key
- Property ID format: GA4 property ID

**HubSpot:**
- Required fields: api_key
- API key format: any non-empty string

**Stripe:**
- Required fields: api_key
- API key format: sk_live_... or sk_test_...

**Zapier:**
- Required fields: webhook_url
- URL format: https://hooks.zapier.com/...

CONVERSATION FLOW EXAMPLES:

**Salesforce to Mailchimp Example:**
- User: "I want to connect Salesforce to Mailchimp"
- Assistant: {"message": "Great! Let's set up your Salesforce to Mailchimp pipeline. What is your Salesforce instance URL? For example: https://yourcompany.my.salesforce.com", "nodes": [{"id": "source-node", "type": "source", "name": "Salesforce Source", "status": "pending", "config": {}}], "connections": [...], "workflow_complete": false}
- User: "https://mydomain.my.salesforce.com"
- Assistant: {"message": "Thank you! Now I need your Salesforce username. For example: user@company.com", "nodes": [{"id": "source-node", "type": "source", "name": "Salesforce Source", "status": "partial", "config": {"instance_url": "https://mydomain.my.salesforce.com"}}], "connections": [...], "workflow_complete": false}
- User: "myuser@company.com"
- Assistant: {"message": "Thank you! Now I need your Salesforce password or access token. For example: mypassword123 or 00D...", "nodes": [{"id": "source-node", "type": "source", "name": "Salesforce Source", "status": "partial", "config": {"instance_url": "https://mydomain.my.salesforce.com", "username": "myuser@company.com"}}], "connections": [...], "workflow_complete": false}

**Shopify to HubSpot Example (Node-by-Node Flow with Persistence):**
- User: "I want to connect Shopify to HubSpot"
- Assistant: {"message": "Great! Let's set up your Shopify to HubSpot pipeline. What is your Shopify store URL? For example: https://mystore.myshopify.com", "nodes": [{"id": "source-node", "type": "source", "name": "Shopify Source", "status": "pending", "config": {}, "data_requirements": {"required_fields": ["store_url", "api_key"], "provided_fields": [], "missing_fields": ["store_url", "api_key"]}}, {"id": "transform-node", "type": "transform", "name": "Data Transform", "status": "pending", "config": {}}, {"id": "destination-node", "type": "destination", "name": "HubSpot Destination", "status": "pending", "config": {}}], "connections": [...], "workflow_complete": false}
- User: "https://mystore.myshopify.com"
- Assistant: {"message": "Thank you! Now I need your Shopify API key. For example: shpat_1234567890abcdef", "nodes": [{"id": "source-node", "type": "source", "name": "Shopify Source", "status": "partial", "config": {"store_url": "https://mystore.myshopify.com"}, "data_requirements": {"required_fields": ["store_url", "api_key"], "provided_fields": ["store_url"], "missing_fields": ["api_key"]}}, {"id": "transform-node", "type": "transform", "name": "Data Transform", "status": "pending", "config": {}}, {"id": "destination-node", "type": "destination", "name": "HubSpot Destination", "status": "pending", "config": {}}], "connections": [...], "workflow_complete": false}
- User: "shpat_1234567890abcdef"
- Assistant: {"message": "Perfect! Your Shopify source is now complete. Now let's configure the transform node. What type of data transformation do you need? For example: filter, aggregate, or map", "nodes": [{"id": "source-node", "type": "source", "name": "Shopify Source", "status": "complete", "config": {"store_url": "https://mystore.myshopify.com", "api_key": "shpat_1234567890abcdef"}, "data_requirements": {"required_fields": ["store_url", "api_key"], "provided_fields": ["store_url", "api_key"], "missing_fields": []}}, {"id": "transform-node", "type": "transform", "name": "Data Transform", "status": "pending", "config": {}, "data_requirements": {"required_fields": ["operation_type"], "provided_fields": [], "missing_fields": ["operation_type"]}}, {"id": "destination-node", "type": "destination", "name": "HubSpot Destination", "status": "pending", "config": {}}], "connections": [...], "workflow_complete": false}

QUESTION EXAMPLES:
- Always include "For example:" in questions to guide users
- Database name: "What's your database name? For example: my_shopify_db"
- API key: "What's your API key? For example: sk_live_1234567890abcdef"
- Username: "What's your username? For example: user@company.com"
- URL: "What's your instance URL? For example: https://yourcompany.my.salesforce.com"

IMPORTANT: Always check the conversation history to see what information has already been provided. Do not ask for the same information twice. ALWAYS update the node configuration with each piece of information provided.

CRITICAL NODE PERSISTENCE: 
- When updating nodes, only provide the fields that are changing or being added
- Do NOT recreate nodes from scratch - preserve existing configuration
- For nodes not being updated, include only essential fields (id, type, name, status)
- The system will automatically merge your updates with existing node data
- Always include all 3 nodes in every response to maintain structure

EXAMPLE: If user provides "https://mystore.myshopify.com", update source-node like this:
{
  "id": "source-node",
  "type": "source", 
  "name": "Shopify Source",
  "status": "partial",
  "config": {"store_url": "https://mystore.myshopify.com"},
  "data_requirements": {
    "required_fields": ["store_url", "api_key"],
    "provided_fields": ["store_url"],
    "missing_fields": ["api_key"]
  }
}

CRITICAL DATA_REQUIREMENTS RULES:
- ALWAYS update data_requirements with each piece of information provided
- Move fields from missing_fields to provided_fields when user provides them
- Update missing_fields to remove fields that are now provided
- Keep required_fields constant (don't change the total requirements)
- Example: If user provides "store_url", move it from missing_fields to provided_fields

WORKFLOW-SPECIFIC FIELD REQUIREMENTS:

SALESFORCE TO MAILCHIMP:
- source-node: required_fields=["instance_url", "username", "password"]
- destination-node: required_fields=["api_key", "datacenter"]

SHOPIFY TO SNOWFLAKE:
- source-node: required_fields=["store_url", "api_key"]
- destination-node: required_fields=["account_url", "username", "password"]

SHOPIFY TO HUBSPOT:
- source-node: required_fields=["store_url", "api_key"]
- destination-node: required_fields=["api_key"]

SALESFORCE TO SNOWFLAKE:
- source-node: required_fields=["instance_url", "username", "password"]
- destination-node: required_fields=["account_url", "username", "password"]

ALWAYS populate the correct required_fields based on the workflow type mentioned by the user.

CRITICAL: Respond with ONLY the JSON object. No text before or after. No markdown. No code blocks. Just pure JSON.

CRITICAL JSON STRUCTURE RULES:
- ALWAYS use the EXACT same JSON structure as shown above
- NEVER add or remove fields from the JSON structure
- NEVER change field names or nesting
- ALWAYS include all 3 nodes with the same structure
- ALWAYS include all data_requirements fields (required_fields, provided_fields, missing_fields)
- ALWAYS include all connection fields (id, source, target, status)

CURRENT STATE HANDLING:
- You will receive "CURRENT WORKFLOW STATE" with the existing node configuration
- Copy the existing state and make ONLY the necessary updates
- DO NOT change any fields that are already correctly set
- Only update: status (if user provided new info), config (add new fields), data_requirements (update provided/missing)
- Preserve all existing configuration and structure

VALIDATION EXAMPLES - WHAT TO ACCEPT:
- User provides "jhkgvhh" → Accept it as valid Salesforce URL
- User provides "fake-api-key-123" → Accept it as valid API key
- User provides "test@example.com" → Accept it as valid email
- User provides "https://fake-store.myshopify.com" → Accept it as valid URL
- ANY input that looks like it could be real data → Accept immediately

NEVER say: "That's not a valid..." or "Please provide the correct..." or "Could you please provide..."
ALWAYS say: "Thank you! Now I need..." and proceed to next question.`;

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
        required_fields: ['connection_string', 'username', 'password'],
        provided_fields: [],
        missing_fields: ['connection_string', 'username', 'password'],
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
        required_fields: ['operation_type'],
        provided_fields: [],
        missing_fields: ['operation_type'],
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
        required_fields: ['api_key', 'endpoint_url'],
        provided_fields: [],
        missing_fields: ['api_key', 'endpoint_url'],
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

    sendThought?.('🤔 Let me think about your request...');

    // Get current workflow state for context
    const existingWorkflowState = getCurrentWorkflowState(conversationHistory);

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

    // Add current state context
    if (existingWorkflowState.nodes && existingWorkflowState.nodes.length > 0) {
      aiMessages.push({
        role: 'user' as const,
        content: `CURRENT WORKFLOW STATE:\n${JSON.stringify(existingWorkflowState, null, 2)}\n\nUpdate this state based on the user's latest input.`,
      });
    }

    // Add system prompt as first message
    const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...aiMessages];

    console.log('📤 Sending to Groq Cloud...');
    sendThought?.('💭 Figuring out the best way to help you...');

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
      sendThought?.('🤔 Let me think about that for a moment...');

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
          sendThought?.(
            "😔 I apologize, but I'm having trouble with this request. Let me try a different approach..."
          );

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
          '🤔 Let me rephrase that for you...',
          '💭 Let me think about this differently...',
          '✨ Almost there, just one more thought...',
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
      // Ensure all 3 nodes are present
      parsed.nodes = ensureAllNodesPresent(parsed.nodes);
      console.log(
        '✅ Final nodes structure:',
        parsed.nodes.map((n: DataFlowNode) => `${n.id} (${n.status})`)
      );
    }

    sendThought?.('✨ Perfect! I have what you need.');

    // Check if workflow state has changed
    const hasStateChange = hasWorkflowStateChanged(
      existingWorkflowState,
      parsed
    );

    // Convert AI response back to our message format
    const response: Message = {
      id: generateId(),
      response_to: currentMessage.id,
      role: 'assistant',
      type: 'MESSAGE',
      content: parsed.message,
      timestamp: new Date().toISOString(),
    };

    // Always include nodes and connections to maintain persistence
    // The frontend will receive the complete updated state
    if (parsed.nodes) {
      response.nodes = parsed.nodes;
    }
    if (parsed.connections) {
      response.connections = parsed.connections;
    }

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
