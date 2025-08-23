import type { ChatState, Message } from '@/store/types';
import type { DataFlowConnection, DataFlowNode, Question } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  currentNodes: [],
  currentConnections: [],
  currentQuestions: [],
  isWorkflowComplete: false,
  thoughts: [],
  pendingMessage: null, // Store message from home page
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ id: string; status: Message['status'] }>
    ) => {
      const message = state.messages.find(msg => msg.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
      }
    },
    clearMessages: state => {
      state.messages = [];
      state.currentNodes = [];
      state.currentConnections = [];
      state.currentQuestions = [];
      state.isWorkflowComplete = false;
      state.thoughts = [];
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateCurrentWorkflow: (
      state,
      action: PayloadAction<{
        nodes: DataFlowNode[];
        connections: DataFlowConnection[];
        questions: Question[];
        isComplete: boolean;
      }>
    ) => {
      state.currentNodes = action.payload.nodes;
      state.currentConnections = action.payload.connections;
      state.currentQuestions = action.payload.questions;
      state.isWorkflowComplete = action.payload.isComplete;
    },
    addThought: (
      state,
      action: PayloadAction<{ messageId: string; thought: string }>
    ) => {
      const thoughtMessage: Message = {
        id: `thought-${Date.now()}`,
        content: action.payload.thought,
        role: 'thought',
        timestamp: new Date(),
        status: 'sent',
      };
      state.thoughts.push(thoughtMessage);
    },
    clearThoughts: state => {
      state.thoughts = [];
    },
    setPendingMessage: (state, action: PayloadAction<string | null>) => {
      state.pendingMessage = action.payload;
    },
  },
});

export const {
  addMessage,
  updateMessageStatus,
  clearMessages,
  setError,
  updateCurrentWorkflow,
  addThought,
  clearThoughts,
  setPendingMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
