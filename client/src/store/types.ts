import type { DataFlowConnection, DataFlowNode, Question } from '@/types';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'thought';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  // Nodes, connections, and questions are part of assistant messages
  nodes?: DataFlowNode[];
  connections?: DataFlowConnection[];
  questions?: Question[];
  isComplete?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  // Current workflow state (from latest assistant message)
  currentNodes: DataFlowNode[];
  currentConnections: DataFlowConnection[];
  currentQuestions: Question[];
  isWorkflowComplete: boolean;
  // AI thoughts as messages with role 'thought'
  thoughts: Message[];
  // Store message from home page to send when workflow page loads
  pendingMessage: string | null;
}
