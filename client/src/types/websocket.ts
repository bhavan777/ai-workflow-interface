export interface WorkflowMessage {
  type:
    | 'conversation_start'
    | 'conversation_continue'
    | 'error'
    | 'status'
    | 'thought';
  id: string;
  data?: Record<string, unknown>;
  error?: string;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
