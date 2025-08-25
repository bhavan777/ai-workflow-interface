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
      maxTokens = 4000,
      temperature = 0.1,
      speed = 'balanced',
      cost = 'medium',
    } = options;

    // Define available models in order of preference
    const availableModels = [
      'llama3-70b-8192',
      'mixtral-8x7b-32768',
      'llama3-8b-8192',
    ];

    let lastError: Error | null = null;

    // Try each model until one works
    for (const model of availableModels) {
      try {
        console.log(`🤖 Trying Groq model: ${model}`);

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
          lastError = new Error(
            errorData.error?.message || 'API request failed'
          );
          continue;
        }

        const data = (await response.json()) as any;
        const responseText = data.choices?.[0]?.message?.content;

        if (!responseText) {
          throw new Error('No response content received');
        }

        console.log(`✅ Success with model: ${model}`);
        return responseText;
      } catch (error) {
        console.warn(`❌ Model ${model} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }
}

// Helper function to detect service types from user message
const detectServiceTypes = (
  message: string
): { sourceType: string; destinationType: string } => {
  const content = message.toLowerCase();

  // Common source patterns
  let sourceType = 'Data Source';
  if (content.includes('shopify')) sourceType = 'Shopify Store';
  else if (content.includes('salesforce')) sourceType = 'Salesforce CRM';
  else if (
    content.includes('mysql') ||
    content.includes('postgresql') ||
    content.includes('database')
  )
    sourceType = 'Database';
  else if (content.includes('api') || content.includes('rest'))
    sourceType = 'API Endpoint';
  else if (
    content.includes('s3') ||
    content.includes('bucket') ||
    content.includes('cloud_storage')
  )
    sourceType = 'Cloud Storage';
  else if (content.includes('bigquery') || content.includes('gcp'))
    sourceType = 'BigQuery Dataset';
  else if (content.includes('mongodb')) sourceType = 'MongoDB Collection';
  else if (content.includes('kafka')) sourceType = 'Kafka Topic';
  else if (content.includes('redis')) sourceType = 'Redis Cache';
  else if (content.includes('elasticsearch'))
    sourceType = 'Elasticsearch Index';
  else if (
    content.includes('file') ||
    content.includes('csv') ||
    content.includes('json')
  )
    sourceType = 'File System';

  // Common destination patterns
  let destinationType = 'Data Destination';
  if (content.includes('snowflake')) destinationType = 'Snowflake Warehouse';
  else if (content.includes('bigquery') || content.includes('gcp'))
    destinationType = 'BigQuery Dataset';
  else if (content.includes('redshift')) destinationType = 'Redshift Cluster';
  else if (content.includes('databricks'))
    destinationType = 'Databricks Lakehouse';
  else if (
    content.includes('mysql') ||
    content.includes('postgresql') ||
    content.includes('database')
  )
    destinationType = 'Database';
  else if (content.includes('api') || content.includes('rest'))
    destinationType = 'API Endpoint';
  else if (content.includes('s3') || content.includes('bucket'))
    destinationType = 'S3 Bucket';
  else if (content.includes('mongodb')) destinationType = 'MongoDB Collection';
  else if (content.includes('kafka')) destinationType = 'Kafka Topic';
  else if (content.includes('elasticsearch'))
    destinationType = 'Elasticsearch Index';
  else if (content.includes('warehouse')) destinationType = 'Data Warehouse';

  return { sourceType, destinationType };
};

// Create a simple hardcoded workflow structure with dynamic names
const createHardcodedWorkflow = (
  sourceType?: string,
  destinationType?: string
) => {
  return {
    nodes: [
      {
        id: 'source-node',
        type: 'source',
        name: sourceType || 'Data Source',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: ['source_type', 'connection_string', 'table_name'],
          provided_fields: [],
          missing_fields: ['source_type', 'connection_string', 'table_name'],
        },
      },
      {
        id: 'transform-node',
        type: 'transform',
        name: 'Data Transform',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: ['operation_type', 'parameters'],
          provided_fields: [],
          missing_fields: ['operation_type', 'parameters'],
        },
      },
      {
        id: 'destination-node',
        type: 'destination',
        name: destinationType || 'Data Destination',
        status: 'pending',
        config: {},
        data_requirements: {
          required_fields: [
            'destination_type',
            'connection_string',
            'table_name',
          ],
          provided_fields: [],
          missing_fields: [
            'destination_type',
            'connection_string',
            'table_name',
          ],
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

// Get the next field to ask for
const getNextField = (workflow: any) => {
  for (const node of workflow.nodes) {
    if (node.data_requirements.missing_fields.length > 0) {
      return {
        nodeId: node.id,
        nodeName: node.name,
        fieldName: node.data_requirements.missing_fields[0],
      };
    }
  }
  return null;
};

// Update workflow with user's answer
const updateWorkflowWithAnswer = (
  workflow: any,
  fieldName: string,
  answer: string
) => {
  for (const node of workflow.nodes) {
    const fieldIndex = node.data_requirements.missing_fields.indexOf(fieldName);
    if (fieldIndex !== -1) {
      // Move field from missing to provided
      node.data_requirements.missing_fields.splice(fieldIndex, 1);
      node.data_requirements.provided_fields.push(fieldName);

      // Update node config with the answer
      node.config[fieldName] = answer;

      // Update node status
      if (node.data_requirements.missing_fields.length === 0) {
        node.status = 'complete';
      } else {
        node.status = 'partial';
      }

      break;
    }
  }
  return workflow;
};

// Check if workflow is complete
const isWorkflowComplete = (workflow: any) => {
  return workflow.nodes.every(
    (node: any) => node.data_requirements.missing_fields.length === 0
  );
};

// Main AI processing function - simplified
export const processMessage = async (
  conversationHistory: Message[],
  currentMessage: Message,
  sendThought?: (thought: string) => void
): Promise<Message> => {
  const groqClient = new GroqCloudClient();

  // Check if this is the first message
  const isFirstMessage = conversationHistory.length === 0;

  // Initialize workflow if it doesn't exist
  let workflowState = getCurrentWorkflowState(conversationHistory);

  if (isFirstMessage) {
    // Detect service types from the first message
    const { sourceType, destinationType } = detectServiceTypes(
      currentMessage.content
    );
    workflowState = createHardcodedWorkflow(sourceType, destinationType);
  } else if (!workflowState) {
    // Fallback if no workflow state found
    workflowState = createHardcodedWorkflow();
  }

  // Get next field to ask for
  const nextField = getNextField(workflowState);

  // Check if workflow is complete
  const isComplete = isWorkflowComplete(workflowState);

  let responseMessage: string;
  let updatedWorkflowState = workflowState;

  if (isFirstMessage) {
    // First message - greet and explain with detected services
    const sourceName = workflowState.nodes[0].name;
    const destinationName = workflowState.nodes[2].name;

    responseMessage = `👋 Hello! I'm here to help you configure your data pipeline workflow.

I'll guide you through setting up a complete data flow with three main components:
1. **${sourceName}** - where your data comes from
2. **Data Transform** - how we process the data
3. **${destinationName}** - where the processed data goes

Let me start by asking about your data source. What type of data source are you using?

> **Example:** \`database\`, \`api\`, \`file\`, \`cloud_storage\``;
  } else {
    // Update workflow with user's answer
    if (nextField && !isComplete) {
      updatedWorkflowState = updateWorkflowWithAnswer(
        workflowState,
        nextField.fieldName,
        currentMessage.content
      );
    }

    // Get the next field after updating
    const updatedNextField = getNextField(updatedWorkflowState);
    const updatedIsComplete = isWorkflowComplete(updatedWorkflowState);

    if (updatedIsComplete) {
      // Workflow is complete
      responseMessage = `🎉 Excellent! Your workflow configuration is now complete.

Here's what we've configured:
${updatedWorkflowState.nodes
  .map(
    (node: any) =>
      `**${node.name}**: ${Object.entries(node.config)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}`
  )
  .join('\n')}

Your data pipeline is ready to be deployed! 🚀`;
    } else if (updatedNextField) {
      // Ask for the next field
      const fieldExamples = {
        source_type: 'database, api, file, cloud_storage',
        connection_string: 'jdbc:mysql://localhost:3306/mydb',
        table_name: 'users, orders, products',
        operation_type: 'filter, aggregate, join, transform',
        parameters: '{"condition": "status = active"}',
        destination_type: 'database, warehouse, api',
      };

      responseMessage = `Great! Now I need to know about the **${updatedNextField.fieldName}** for your ${updatedNextField.nodeName}.

> **Example:** \`${fieldExamples[updatedNextField.fieldName as keyof typeof fieldExamples] || 'your value here'}\``;
    } else {
      // Fallback
      responseMessage =
        "I'm not sure what to ask next. Let me check the workflow state.";
    }
  }

  // Create the response Message object
  const response: Message = {
    id: generateId(),
    response_to: currentMessage.id,
    role: 'assistant',
    type: 'MESSAGE',
    content: responseMessage,
    message_type: 'markdown',
    timestamp: new Date().toISOString(),
    nodes: updatedWorkflowState.nodes,
    connections: updatedWorkflowState.connections,
    workflow_complete: isWorkflowComplete(updatedWorkflowState),
  };

  return response;
};

// Helper function to get current workflow state from conversation history
const getCurrentWorkflowState = (conversationHistory: Message[]): any => {
  // Find the last message with nodes and connections
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const message = conversationHistory[i];
    if (message.nodes && message.connections) {
      return { nodes: message.nodes, connections: message.connections };
    }
  }
  return null;
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Function to clear all conversations (in-memory only)
export const clearAllConversations = (): void => {
  console.log('✅ All conversations cleared (in-memory only)');
};

export interface Message {
  id: string;
  response_to?: string;
  role: 'user' | 'assistant';
  type: 'MESSAGE' | 'THOUGHT' | 'ERROR' | 'STATUS';
  content: string;
  timestamp: string;
  message_type?: 'text' | 'markdown';
  nodes?: DataFlowNode[];
  connections?: DataFlowConnection[];
  workflow_complete?: boolean;
  node_status_updates?: Array<{
    node_id: string;
    status: DataFlowNode['status'];
  }>;
  status?: 'processing' | 'complete' | 'error';
}

// Simple interfaces for the hardcoded workflow
export interface DataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: Record<string, any>;
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
