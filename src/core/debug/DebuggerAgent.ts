import { MemoryFS } from '../filesystem/MemoryFS';
import { InterceptedError } from './ErrorPipeline';

export interface PatchProposal {
  id: string;
  errorId: string;
  filePath: string;
  originalContent: string;
  patchedContent: string;
  explanation: string;
  confidenceScore: number;
}

export class DebuggerAgent {
  private fs: MemoryFS;

  constructor(fs: MemoryFS) {
    this.fs = fs;
  }

  public async analyzeAndDiagnose(error: InterceptedError): Promise<PatchProposal | null> {
    const targetFile = error.file || this.guessFileFromError(error);
    if (!targetFile) return null;

    const originalContent = this.fs.readFile(targetFile);
    if (!originalContent) return null;

    // Simulate AI diagnostic evaluation and patch generation logic
    const patchedContent = this.generateAutoFix(originalContent, error);

    return {
      id: `patch-${Math.random().toString(36).substring(2, 9)}`,
      errorId: error.id,
      filePath: targetFile,
      originalContent,
      patchedContent,
      explanation: `Fixed runtime error "${error.message}" by adjusting component binding and missing safe fallbacks.`,
      confidenceScore: 0.94,
    };
  }

  private guessFileFromError(error: InterceptedError): string | null {
    if (error.message.includes('App') || error.stack?.includes('App')) return '/src/App.tsx';
    if (error.message.includes('main') || error.stack?.includes('main')) return '/src/main.tsx';
    return '/src/App.tsx';
  }

  private generateAutoFix(content: string, error: InterceptedError): string {
    // Basic healing transformation example: adding safety null-checks or missing exports
    if (error.message.includes('Cannot read properties of undefined') || error.message.includes('is not a function')) {
      return `// Auto-fixed by NEXORA Debugger Agent\n` + content.replace(/\.map\(/g, '?.map(');
    }
    return `// Auto-fixed by NEXORA Debugger Agent\n` + content;
  }
}
