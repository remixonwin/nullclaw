import { create } from 'zustand';
import { Message, ToolCall, ToolResult, ApprovalRequest } from '../types';

interface ChatState {
  messages: Message[];
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
  approvalRequests: ApprovalRequest[];
  addMessage: (message: Message) => void;
  addToolCall: (toolCall: ToolCall) => void;
  addToolResult: (toolResult: ToolResult) => void;
  addApprovalRequest: (approvalRequest: ApprovalRequest) => void;
  clearMessages: () => void;
  clearAll: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  toolCalls: [],
  toolResults: [],
  approvalRequests: [],
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  addToolCall: (toolCall: ToolCall) => {
    set((state) => ({
      toolCalls: [...state.toolCalls, toolCall],
    }));
  },
  addToolResult: (toolResult: ToolResult) => {
    set((state) => ({
      toolResults: [...state.toolResults, toolResult],
    }));
  },
  addApprovalRequest: (approvalRequest: ApprovalRequest) => {
    set((state) => ({
      approvalRequests: [...state.approvalRequests, approvalRequest],
    }));
  },
  clearMessages: () => {
    set({ messages: [] });
  },
  clearAll: () => {
    set({
      messages: [],
      toolCalls: [],
      toolResults: [],
      approvalRequests: [],
    });
  },
}));