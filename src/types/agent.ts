export type AgentRole = 'Planner' | 'Architect' | 'Coding' | 'UI/UX' | 'Debugger' | 'System';

export interface ToolCall {
  id: string;
  name: 'write_file' | 'edit_file' | 'delete_file' | 'list_files' | 'read_file' | 'create_plan';
  args: Record<string, any>;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentRole?: AgentRole;
  toolCalls?: ToolCall[];
  fileChanges?: {
    created: string[];
    modified: string[];
    deleted: string[];
  };
}

export interface AgentTask {
  id: string;
  agentName: AgentRole;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: number;
}
