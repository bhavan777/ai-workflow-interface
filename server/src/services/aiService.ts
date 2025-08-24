import * as fs from 'fs';
import fetch from 'node-fetch';
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
  private selectBestModel(messages: any[]): string {
    const lastUserMessage =
      messages.filter(m => m.role === 'user').pop()?.content || '';
    const messageLength = lastUserMessage.length;

    // For JSON generation tasks, prioritize models that are better at structured output
    // LLaMA 3.3 70B is more reliable for complex structured tasks
    // LLaMA 3.1 70B is also good for structured output
    // LLaMA 3.1 8B Instant is faster but less reliable for strict JSON formatting

    // Always use a more reliable model for JSON generation
    console.log('🧠 Using LLaMA 3.3 70B for reliable JSON generation');
    return 'llama-3.3-70b-versatile';
  }

  async generateResponse(messages: any[]): Promise<string> {
    // Automatically select the best model for this task
    const selectedModel = this.selectBestModel(messages);

    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Try the primary model first, then fallback to alternatives
    const modelsToTry = [
      selectedModel,
      'llama-3.1-70b-versatile', // Fallback 1: LLaMA 3.1 70B
      'llama3-8b-8192', // Fallback 2: LLaMA 3.1 8B
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${model}`);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: openAIMessages,
            max_tokens: 2000,
            temperature: 0, // Use 0 temperature for deterministic JSON generation
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(
            `⚠️ Model ${model} failed: ${response.status} - ${errorText}`
          );
          continue; // Try next model
        }

        const data = (await response.json()) as any;
        console.log(`✅ Successfully used model: ${model}`);
        return data.choices[0].message.content;
      } catch (error) {
        console.warn(`⚠️ Model ${model} failed:`, error);
        continue; // Try next model
      }
    }

    throw new Error('All available models failed to generate a response');
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
}

export interface DataFlowConnection {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'complete' | 'error';
}

const SYSTEM_PROMPT = `You are a data integration expert helping users build data pipelines through conversation.

CRITICAL: You MUST respond with ONLY a valid JSON object. No text before or after the JSON. No explanations. Just the JSON.

RESPONSE FORMAT - COPY THIS EXACTLY:
{
  "message": "Thank you for that information! Now I need to know: [next single question]",
  "nodes": [
    {
      "id": "source-node",
      "type": "source", 
      "name": "[Source Name]",
      "status": "partial|complete|pending",
      "config": { "field1": "provided_value", "field2": "provided_value" }
    },
    {
      "id": "transform-node",
      "type": "transform",
      "name": "Data Transform", 
      "status": "pending",
      "config": {}
    },
    {
      "id": "destination-node",
      "type": "destination",
      "name": "[Destination Name]",
      "status": "pending", 
      "config": {}
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
      "config": { "field1": "provided_value", "field2": "provided_value" }
    },
    {
      "id": "transform-node",
      "type": "transform",
      "name": "Data Transform", 
      "status": "complete",
      "config": { "type": "provided_value" }
    },
    {
      "id": "destination-node",
      "type": "destination",
      "name": "[Destination Name]",
      "status": "complete", 
      "config": { "field1": "provided_value", "field2": "provided_value" }
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
3. Start with source configuration, then transform, then destination
4. Update node status: "pending" → "partial" → "complete" based on provided info
5. ALWAYS update node config with each piece of information provided
6. Thank user for each piece of information provided
7. Ask the next single question needed
8. Set node status to "complete" when all required fields for that node are provided
9. When all nodes are "complete", set "workflow_complete": true and provide success message
10. NEVER ask for information that has already been provided
11. ALWAYS check conversation history to see what information is already available
12. If user provides information for a different step, acknowledge it and continue with the current step
13. If user asks about options, provide them clearly and ask for their choice
14. ACCEPT any user input unless it's clearly invalid (e.g., non-URL for URL fields)
15. For validation failures, explain the issue and provide a clear example of valid input
16. Be flexible with input formats - accept variations and common formats
17. DYNAMICALLY determine source and destination based on user's request
18. Ask relevant questions for the specific source/destination combination
19. ALWAYS include the current node configuration in your response

VALIDATION RULES:
- Only validate when absolutely necessary (URLs, email formats, etc.)
- For URLs: Must start with http:// or https:// or be a valid domain format
- For API keys: Accept any non-empty string
- For names/descriptions: Accept any non-empty text
- For options: Accept variations (e.g., "filter", "Filter", "FILTER" all work)
- When validation fails, provide: "I need a valid [field type]. For example: [specific example]"

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
- Assistant: {"message": "Great! Let's set up your Salesforce to Mailchimp pipeline. What is your Salesforce instance URL?", "nodes": [{"id": "source-node", "type": "source", "name": "Salesforce Source", "status": "pending", "config": {}}], "connections": [...], "workflow_complete": false}
- User: "https://mydomain.my.salesforce.com"
- Assistant: {"message": "Thank you! Now I need your Salesforce username.", "nodes": [{"id": "source-node", "type": "source", "name": "Salesforce Source", "status": "partial", "config": {"instance_url": "https://mydomain.my.salesforce.com"}}], "connections": [...], "workflow_complete": false}
- User: "myuser@company.com"
- Assistant: {"message": "Thank you! Now I need your Salesforce password or access token.", "nodes": [{"id": "source-node", "type": "source", "name": "Salesforce Source", "status": "partial", "config": {"instance_url": "https://mydomain.my.salesforce.com", "username": "myuser@company.com"}}], "connections": [...], "workflow_complete": false}

**Shopify to HubSpot Example:**
- User: "I want to connect Shopify to HubSpot"
- Assistant: {"message": "Great! Let's set up your Shopify to HubSpot pipeline. What is your Shopify store URL?", "nodes": [{"id": "source-node", "type": "source", "name": "Shopify Source", "status": "pending", "config": {}}], "connections": [...], "workflow_complete": false}

VALIDATION EXAMPLES:
- If user provides "my domain" for Salesforce URL: "I need a valid URL. For example: https://yourdomain.my.salesforce.com"
- If user provides empty string: "I need your [field name]. Please provide a value."
- If user provides invalid option: "Please choose from: Filter, Aggregate, Join, or Map"

IMPORTANT: Always check the conversation history to see what information has already been provided. Do not ask for the same information twice. ALWAYS update the node configuration with each piece of information provided.

CRITICAL: Respond with ONLY the JSON object. No text before or after. No markdown. No code blocks. Just pure JSON.`;

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

// Helper function to check if workflow state has changed
const hasWorkflowStateChanged = (
  currentState: { nodes?: DataFlowNode[]; connections?: DataFlowConnection[] },
  newResponse: any
): boolean => {
  // If no current state, any new state is a change
  if (!currentState.nodes && !currentState.connections) {
    return !!(newResponse.nodes || newResponse.connections);
  }

  // Compare nodes
  if (newResponse.nodes) {
    if (
      !currentState.nodes ||
      JSON.stringify(currentState.nodes) !== JSON.stringify(newResponse.nodes)
    ) {
      return true;
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

    // Convert conversation history to AI format
    const aiMessages = conversationHistory.map(msg => ({
      role: msg.role,
      content: formatMessageForAI(msg),
    }));

    // Add current message
    aiMessages.push({
      role: currentMessage.role,
      content: formatMessageForAI(currentMessage),
    });

    // Add system prompt as first message
    const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...aiMessages];

    console.log('📤 Sending to Groq Cloud...');
    sendThought?.('💭 Figuring out the best way to help you...');

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

    sendThought?.('✨ Perfect! I have what you need.');

    // Get current workflow state from conversation history
    const currentState = getCurrentWorkflowState(conversationHistory);

    // Check if workflow state has changed
    const hasStateChange = hasWorkflowStateChanged(currentState, parsed);

    // Convert AI response back to our message format
    const response: Message = {
      id: generateId(),
      response_to: currentMessage.id,
      role: 'assistant',
      type: 'MESSAGE',
      content: parsed.message,
      timestamp: new Date().toISOString(),
    };

    // Only include nodes and connections if state changed
    if (hasStateChange) {
      response.nodes = parsed.nodes || [];
      response.connections = parsed.connections || [];
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
