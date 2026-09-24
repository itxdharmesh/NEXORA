import { create } from 'zustand';
import { ChatMessage, AgentTask, ToolCall } from '../types/agent';
import { MemoryFS } from '../core/filesystem/MemoryFS';
import { ToolRegistry } from '../core/tools/ToolRegistry';
import { MockStreamingAdapter } from '../core/model/MockStreamingAdapter';

interface AgentStoreState {
  messages: ChatMessage[];
  tasks: AgentTask[];
  isProcessing: boolean;
  currentAgentRole: string;
  submitPrompt: (prompt: string, fs: MemoryFS) => Promise<void>;
  clearHistory: () => void;
}

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  messages: [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: 'Welcome to **NEXORA**. Describe the application or component you want to build, and I will create the project plan, code structure, and live UI.',
      timestamp: Date.now(),
      agentRole: 'Planner',
    },
  ],
  tasks: [],
  isProcessing: false,
  currentAgentRole: 'Planner',

  submitPrompt: async (prompt: string, fs: MemoryFS) => {
    const userMsgId = `msg-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isProcessing: true,
      currentAgentRole: 'Planner',
    }));

    const toolRegistry = new ToolRegistry(fs);
    const modelAdapter = new MockStreamingAdapter();

    const assistantMsgId = `msg-${Date.now() + 1}`;
    let currentText = '';
    const activeToolCalls: ToolCall[] = [];
    const createdFiles: string[] = [];
    const modifiedFiles: string[] = [];
    const deletedFiles: string[] = [];

    // Stream chunks
    await modelAdapter.generateCompletion(
      [{ role: 'user', content: prompt }],
      (textChunk) => {
        currentText += textChunk;
        set((state) => {
          const filtered = state.messages.filter((m) => m.id !== assistantMsgId);
          return {
            messages: [
              ...filtered,
              {
                id: assistantMsgId,
                sender: 'assistant',
                content: currentText,
                timestamp: Date.now(),
                agentRole: 'Coding',
                toolCalls: [...activeToolCalls],
              },
            ],
          };
        });
      },
      async (rawToolCall) => {
        const toolCall: ToolCall = {
          id: rawToolCall.id,
          name: rawToolCall.name,
          args: rawToolCall.arguments,
          status: 'running',
        };
        activeToolCalls.push(toolCall);

        // Execute against MemoryFS
        const res = await toolRegistry.executeTool(toolCall);
        toolCall.status = res.success ? 'success' : 'error';
        toolCall.result = res.output;

        if (res.fileChanges) {
          if (res.fileChanges.created) createdFiles.push(res.fileChanges.created);
          if (res.fileChanges.modified) modifiedFiles.push(res.fileChanges.modified);
          if (res.fileChanges.deleted) deletedFiles.push(res.fileChanges.deleted);
        }

        // Update UI
        set((state) => {
          const filtered = state.messages.filter((m) => m.id !== assistantMsgId);
          return {
            messages: [
              ...filtered,
              {
                id: assistantMsgId,
                sender: 'assistant',
                content: currentText,
                timestamp: Date.now(),
                agentRole: 'Coding',
                toolCalls: [...activeToolCalls],
                fileChanges: {
                  created: createdFiles,
                  modified: modifiedFiles,
                  deleted: deletedFiles,
                },
              },
            ],
          };
        });
      }
    );

    set({ isProcessing: false });
  },

  clearHistory: () => set({ messages: [], tasks: [] }),
}));
