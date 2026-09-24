import { AIModelAdapter, AgentMessage } from '../model/AIModelAdapter';
import { MemoryFS } from '../filesystem/MemoryFS';

export interface AgentTask {
  id: string;
  agentName: 'Planner' | 'Architect' | 'Coding' | 'UI/UX' | 'Debugger';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: number;
}

export class MultiAgentOrchestrator {
  private modelAdapter: AIModelAdapter;
  private virtualFS: MemoryFS;
  private taskHistory: AgentTask[] = [];

  constructor(adapter: AIModelAdapter, fs: MemoryFS) {
    this.modelAdapter = adapter;
    this.virtualFS = fs;
  }

  public async processUserPrompt(prompt: string, onUpdate: (task: AgentTask) => void): Promise<void> {
    const planTask: AgentTask = {
      id: `task-${Date.now()}-1`,
      agentName: 'Planner',
      description: `Analyzing request and creating implementation architecture for: "${prompt}"`,
      status: 'in_progress',
      timestamp: Date.now(),
    };
    onUpdate(planTask);

    const planMessages: AgentMessage[] = [
      {
        role: 'system',
        content: `You are the Lead Planner Agent for NEXORA. Deconstruct the user prompt into modular architectural tasks. Return structured bullet points.`,
      },
      { role: 'user', content: prompt },
    ];

    const planResult = await this.modelAdapter.generateCompletion(planMessages);
    
    // Save to Agent Memory System (.nexora/plan.md)
    this.virtualFS.writeFile('/.nexora/plan.md', `# Implementation Plan\n\nPrompt: ${prompt}\n\n${planResult.content}`);
    
    planTask.status = 'completed';
    onUpdate(planTask);

    const codingTask: AgentTask = {
      id: `task-${Date.now()}-2`,
      agentName: 'Coding',
      description: `Synthesizing project component structure and scaffolding virtual workspace...`,
      status: 'in_progress',
      timestamp: Date.now(),
    };
    onUpdate(codingTask);

    // Write initial index file & tracking state
    this.virtualFS.writeFile(
      '/.nexora/progress.md',
      `# NEXORA Progress tracking\n\n- Completed Initial Plan creation\n- Scaffolding project code structure`
    );

    codingTask.status = 'completed';
    onUpdate(codingTask);
  }

  public getTasks(): AgentTask[] {
    return [...this.taskHistory];
  }
}
