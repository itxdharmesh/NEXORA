import { MemoryFS } from '../filesystem/MemoryFS';
import { ToolCall } from '../../types/agent';

export interface ToolExecutionResult {
  success: boolean;
  output: string;
  fileChanges?: {
    created?: string;
    modified?: string;
    deleted?: string;
  };
}

export class ToolRegistry {
  private fs: MemoryFS;

  constructor(fs: MemoryFS) {
    this.fs = fs;
  }

  public async executeTool(toolCall: ToolCall): Promise<ToolExecutionResult> {
    const { name, args } = toolCall;

    switch (name) {
      case 'write_file': {
        const { path, content } = args;
        if (!path || content === undefined) {
          return { success: false, output: 'Error: Missing path or content argument' };
        }
        const exists = this.fs.readFile(path) !== null;
        this.fs.writeFile(path, content);
        return {
          success: true,
          output: `Successfully wrote ${content.length} characters to ${path}`,
          fileChanges: exists ? { modified: path } : { created: path },
        };
      }

      case 'edit_file': {
        const { path, search, replace } = args;
        const current = this.fs.readFile(path);
        if (current === null) {
          return { success: false, output: `Error: File not found at ${path}` };
        }
        if (!current.includes(search)) {
          return { success: false, output: `Error: Target search block not found in ${path}` };
        }
        const updated = current.replace(search, replace);
        this.fs.writeFile(path, updated);
        return {
          success: true,
          output: `Successfully patched ${path}`,
          fileChanges: { modified: path },
        };
      }

      case 'delete_file': {
        const { path } = args;
        const deleted = this.fs.deleteNode(path);
        if (!deleted) {
          return { success: false, output: `Error: Could not delete ${path}` };
        }
        return {
          success: true,
          output: `Successfully deleted ${path}`,
          fileChanges: { deleted: path },
        };
      }

      case 'read_file': {
        const { path } = args;
        const content = this.fs.readFile(path);
        if (content === null) {
          return { success: false, output: `Error: File not found at ${path}` };
        }
        return { success: true, output: content };
      }

      case 'list_files': {
        const tree = this.fs.getTree();
        return { success: true, output: JSON.stringify(tree, null, 2) };
      }

      default:
        return { success: false, output: `Error: Unknown tool name "${name}"` };
    }
  }
}
