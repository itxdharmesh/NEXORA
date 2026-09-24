export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  updatedAt: number;
}

type FSEventListener = (event: 'change' | 'delete' | 'create', path: string) => void;

export class MemoryFS {
  private root: FileNode[];
  private listeners: Set<FSEventListener> = new Set();

  constructor(initialFiles: FileNode[] = []) {
    this.root = initialFiles;
  }

  public subscribe(listener: FSEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: 'change' | 'delete' | 'create', path: string) {
    this.listeners.forEach((fn) => fn(event, path));
  }

  public getTree(): FileNode[] {
    return JSON.parse(JSON.stringify(this.root));
  }

  public readFile(path: string): string | null {
    const node = this.findNode(path, this.root);
    return node && node.type === 'file' ? node.content ?? '' : null;
  }

  public writeFile(path: string, content: string): boolean {
    const normalized = path.startsWith('/') ? path : '/' + path;
    const parts = normalized.split('/').filter(Boolean);
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
    const isNew = !existingFile;

    if (existingFile) {
      existingFile.content = content;
      existingFile.updatedAt = Date.now();
    } else {
      currentLevel.push({
        id: `file-${Math.random().toString(36).substring(2, 9)}`,
        name: fileName,
        path: normalized,
        type: 'file',
        content,
        updatedAt: Date.now(),
      });
    }

    this.notify(isNew ? 'create' : 'change', normalized);
    return true;
  }

  public deleteNode(path: string): boolean {
    const normalized = path.startsWith('/') ? path : '/' + path;
    const parentDir = normalized.substring(0, normalized.lastIndexOf('/')) || '/';
    const targetName = normalized.substring(normalized.lastIndexOf('/') + 1);

    const parentList = parentDir === '/' ? this.root : this.findNode(parentDir, this.root)?.children;
    if (!parentList) return false;

    const index = parentList.findIndex((n) => n.name === targetName);
    if (index !== -1) {
      parentList.splice(index, 1);
      this.notify('delete', normalized);
      return true;
    }
    return false;
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
