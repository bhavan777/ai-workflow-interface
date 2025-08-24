import type { DataFlowConnection, DataFlowNode, Message } from '@/types';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  currentThought: string | null;
}

// Re-export the Message type for convenience
export type { Message } from '@/types';
