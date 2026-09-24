export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface CompletionResponse {
  content: string;
  toolCalls?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }[];
  tokensUsed?: number;
}

export interface AIModelAdapter {
  providerName: string;
  modelName: string;
  generateCompletion(
    messages: AgentMessage[],
    tools?: ToolDefinition[]
  ): Promise<CompletionResponse>;
}
