import { MemoryFS } from '../filesystem/MemoryFS';

export interface InterceptedError {
  id: string;
  source: 'runtime' | 'compiler' | 'network';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: number;
  status: 'OPEN' | 'ANALYZING' | 'PATCHED' | 'IGNORED';
}

export class ErrorPipeline {
  private fs: MemoryFS;
  private listeners: Set<(error: InterceptedError) => void> = new Set();

  constructor(fs: MemoryFS) {
    this.fs = fs;
  }

  public subscribe(callback: (error: InterceptedError) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public reportError(error: Omit<InterceptedError, 'id' | 'timestamp' | 'status'>): InterceptedError {
    const fullError: InterceptedError = {
      ...error,
      id: `err-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      status: 'OPEN',
    };

    this.logToMemoryFile(fullError);
    this.listeners.forEach((listener) => listener(fullError));
    return fullError;
  }

  private logToMemoryFile(error: InterceptedError): void {
    const current = this.fs.readFile('/.nexora/errors.md') || '# Runtime & Build Error History\n\n';
    const entry =
      `### [${error.status}] ${error.source.toUpperCase()} ERROR: ${error.id}\n` +
      `- **Timestamp**: ${new Date(error.timestamp).toLocaleTimeString()}\n` +
      `- **Message**: \`${error.message}\`\n` +
      `- **Location**: ${error.file || 'Unknown'}${error.line ? `:${error.line}:${error.column}` : ''}\n` +
      (error.stack ? `\`\`\`\n${error.stack}\n\`\`\`\n\n` : '\n');

    this.fs.writeFile('/.nexora/errors.md', current + entry);
  }
}
