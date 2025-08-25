export interface Message {
  id: string; // Unique message ID
  response_to?: string; // ID of message this responds to (for conversation threading)
  role: 'user' | 'assistant'; // Who sent the message
  type:
    | 'MESSAGE'
    | 'THOUGHT'
    | 'ERROR'
    | 'STATUS'
    | 'NODE_DATA'
    | 'GET_NODE_DATA';
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

  // For NODE_DATA responses and GET_NODE_DATA requests
  node_id?: string;
  node_title?: string;
  filled_values?: Record<string, string>;
}

export interface GetNodeDataEvent {
  type: 'GET_NODE_DATA';
  node_id: string;
}

export interface NodeDataResponse {
  type: 'NODE_DATA';
  node_id: string;
  node_title: string;
  node_status?: 'pending' | 'partial' | 'complete' | 'error';
  filled_values: Record<string, string>; // field_name -> value or "Not filled"
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

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
