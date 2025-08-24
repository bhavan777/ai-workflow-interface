import type { DataFlowConnection, DataFlowNode, Message } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  currentThought: string | null; // Server-sent only, read-only
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  currentWorkflow: {
    nodes: [],
    connections: [],
  },
  currentThought: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      // Only add non-thought messages to the messages array
      if (action.payload.type !== 'THOUGHT') {
        state.messages.push(action.payload);
      }

      // Update workflow state if message contains nodes/connections
      if (action.payload.nodes && action.payload.connections) {
        state.currentWorkflow.nodes = action.payload.nodes;
        state.currentWorkflow.connections = action.payload.connections;
      }
    },

    setCurrentThought: (state, action: PayloadAction<string | null>) => {
      // Server-sent only, read-only
      state.currentThought = action.payload;
    },

    clearMessages: state => {
      state.messages = [];
      state.currentWorkflow.nodes = [];
      state.currentWorkflow.connections = [];
      state.currentThought = null;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addMessage,
  setCurrentThought,
  clearMessages,
  setError,
  setLoading,
} = chatSlice.actions;

export default chatSlice.reducer;
