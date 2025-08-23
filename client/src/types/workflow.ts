export interface DataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: Record<string, unknown>;
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
