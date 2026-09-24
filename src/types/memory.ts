export interface PlanStep {
  id: string;
  title: string;
  category: 'architecture' | 'scaffolding' | 'ui' | 'logic' | 'testing' | 'optimization';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'PENDING';
  details?: string;
  assignedAgent: string;
}

export interface DecisionRecord {
  id: string;
  timestamp: number;
  title: string;
  context: string;
  decision: string;
  consequences: string;
}

export interface NexoraProjectConfig {
  id: string;
  name: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  agentSettings: {
    model: string;
    autoFix: boolean;
    sandboxMode: 'development' | 'isolated';
  };
}
