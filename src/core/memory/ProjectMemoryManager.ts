import { MemoryFS } from '../filesystem/MemoryFS';
import { PlanStep, DecisionRecord, NexoraProjectConfig } from '../../types/memory';

export class ProjectMemoryManager {
  private fs: MemoryFS;
  private projectId: string;

  constructor(fs: MemoryFS, projectId: string = 'default-project') {
    this.fs = fs;
    this.projectId = projectId;
  }

  public initializeMemoryFiles(projectName: string): void {
    const config: NexoraProjectConfig = {
      id: this.projectId,
      name: projectName,
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agentSettings: {
        model: 'nexora-agent-v1',
        autoFix: true,
        sandboxMode: 'development',
      },
    };

    this.fs.writeFile('/.nexora/project.json', JSON.stringify(config, null, 2));

    if (!this.fs.readFile('/.nexora/plan.md')) {
      this.fs.writeFile(
        '/.nexora/plan.md',
        `# Project Plan: ${projectName}\n\n## Objectives\n- Initialize core structure\n- Implement UI layout\n- Connect logic\n`
      );
    }

    if (!this.fs.readFile('/.nexora/progress.md')) {
      this.fs.writeFile(
        '/.nexora/progress.md',
        `# Progress Log\n\n### COMPLETED\n- Initial project creation\n\n### IN PROGRESS\n- Scaffolding components\n\n### NEXT TASKS\n- Wire live reactivity\n`
      );
    }

    if (!this.fs.readFile('/.nexora/decisions.md')) {
      this.fs.writeFile('/.nexora/decisions.md', `# Architectural Decisions Log\n\n`);
    }

    if (!this.fs.readFile('/.nexora/errors.md')) {
      this.fs.writeFile('/.nexora/errors.md', `# Runtime & Build Error History\n\n`);
    }
  }

  public recordDecision(decision: DecisionRecord): void {
    const current = this.fs.readFile('/.nexora/decisions.md') || '# Architectural Decisions Log\n\n';
    const entry = `### ${decision.title} (${new Date(decision.timestamp).toLocaleTimeString()})\n` +
      `- **Context**: ${decision.context}\n` +
      `- **Decision**: ${decision.decision}\n` +
      `- **Consequences**: ${decision.consequences}\n\n`;

    this.fs.writeFile('/.nexora/decisions.md', current + entry);
  }

  public parsePlanSteps(): PlanStep[] {
    const planText = this.fs.readFile('/.nexora/plan.md') || '';
    const progressText = this.fs.readFile('/.nexora/progress.md') || '';
    const steps: PlanStep[] = [];

    const lines = progressText.split('\n');
    let currentStatus: PlanStep['status'] = 'PENDING';

    lines.forEach((line, idx) => {
      if (line.includes('COMPLETED')) currentStatus = 'COMPLETED';
      else if (line.includes('IN PROGRESS')) currentStatus = 'IN_PROGRESS';
      else if (line.includes('BLOCKED')) currentStatus = 'BLOCKED';
      else if (line.includes('NEXT TASKS')) currentStatus = 'PENDING';
      else if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]') || line.trim().startsWith('-')) {
        const cleanTitle = line.replace(/^- \[[x ]\]|- /, '').trim();
        if (cleanTitle) {
          steps.push({
            id: `step-${idx}`,
            title: cleanTitle,
            category: 'logic',
            status: line.includes('[x]') ? 'COMPLETED' : currentStatus,
            assignedAgent: 'Planner',
          });
        }
      }
    });

    return steps;
  }
}
