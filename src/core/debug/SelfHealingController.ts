import { MemoryFS } from '../filesystem/MemoryFS';
import { ErrorPipeline, InterceptedError } from './ErrorPipeline';
import { DebuggerAgent, PatchProposal } from './DebuggerAgent';
import { ProjectMemoryManager } from '../memory/ProjectMemoryManager';

export class SelfHealingController {
  private fs: MemoryFS;
  private pipeline: ErrorPipeline;
  private agent: DebuggerAgent;
  private memoryManager: ProjectMemoryManager;
  private autoApply: boolean = true;

  constructor(fs: MemoryFS) {
    this.fs = fs;
    this.pipeline = new ErrorPipeline(fs);
    this.agent = new DebuggerAgent(fs);
    this.memoryManager = new ProjectMemoryManager(fs);

    this.pipeline.subscribe((error) => this.handleIncomingError(error));
  }

  public getPipeline(): ErrorPipeline {
    return this.pipeline;
  }

  public setAutoApply(enabled: boolean): void {
    this.autoApply = enabled;
  }

  private async handleIncomingError(error: InterceptedError): Promise<void> {
    console.log(`[NEXORA Self-Healing] Analyzing Error: ${error.id}`);

    const patch = await this.agent.analyzeAndDiagnose(error);
    if (!patch) return;

    if (this.autoApply) {
      this.applyPatch(patch);
    }
  }

  public applyPatch(patch: PatchProposal): void {
    this.fs.writeFile(patch.filePath, patch.patchedContent);

    this.memoryManager.recordDecision({
      id: `dec-${Date.now()}`,
      timestamp: Date.now(),
      title: `Auto-Fix Applied for ${patch.errorId}`,
      context: `Self-healing loop triggered by runtime error on ${patch.filePath}`,
      decision: patch.explanation,
      consequences: `Updated file ${patch.filePath}. Live preview will automatically reload.`,
    });

    console.log(`[NEXORA Self-Healing] Patch applied successfully to ${patch.filePath}`);
  }
}
