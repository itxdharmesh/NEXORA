export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  updatedAt: number;
}

export class MemoryFS {
  private root: FileNode[];

  constructor(initialFiles: FileNode[] = []) {
    this.root = initialFiles;
  }

  public getTree(): FileNode[] {
    return JSON.parse(JSON.stringify(this.root));
  }

  public readFile(path: string): string | null {
    const node = this.findNode(path, this.root);
    return node && node.type === 'file' ? node.content ?? '' : null;
  }

  public writeFile(path: string, content: string): boolean {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) return false;

    let currentLevel = this.root;
    let currentPath = '';

    for (const dirName of parts) {
      currentPath += '/' + dirName;
      let dirNode = currentLevel.find((n) => n.name === dirName && n.type === 'directory');
      if (!dirNode) {
        dirNode = {
          id: `dir-${Math.random().toString(36).substring(2, 9)}`,
          name: dirName,
          path: currentPath,
          type: 'directory',
          children: [],
          updatedAt: Date.now(),
        };
        currentLevel.push(dirNode);
      }
      currentLevel = dirNode.children!;
    }

    const existingFile = currentLevel.find((n) => n.name === fileName && n.type === 'file');
    if (existingFile) {
      existingFile.content = content;
      existingFile.updatedAt = Date.now();
    } else {
      currentLevel.push({
        id: `file-${Math.random().toString(36).substring(2, 9)}`,
        name: fileName,
        path: path.startsWith('/') ? path : '/' + path,
        type: 'file',
        content,
        updatedAt: Date.now(),
      });
    }
    return true;
  }

  public searchCode(query: string): { path: string; line: number; snippet: string }[] {
    const results: { path: string; line: number; snippet: string }[] = [];
    const searchRecursively = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'directory' && node.children) {
          searchRecursively(node.children);
        } else if (node.type === 'file' && node.content) {
          const lines = node.content.split('\n');
          lines.forEach((lineText, idx) => {
            if (lineText.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                path: node.path,
                line: idx + 1,
                snippet: lineText.trim(),
              });
            }
          });
        }
      }
    };
    searchRecursively(this.root);
    return results;
  }

  private findNode(path: string, nodes: FileNode[]): FileNode | null {
    const normalized = path.startsWith('/') ? path : '/' + path;
    for (const node of nodes) {
      if (node.path === normalized) return node;
      if (node.type === 'directory' && node.children) {
        const found = this.findNode(normalized, node.children);
        if (found) return found;
      }
    }
    return null;
  }
}
