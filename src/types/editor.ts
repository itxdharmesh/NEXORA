export interface EditorTab {
  id: string;          // Full path of the file (e.g. "/src/App.tsx")
  path: string;
  name: string;
  extension: string;
  isDirty: boolean;     // True when buffer content differs from MemoryFS
  content: string;     // Active editor buffer text
  savedContent: string;
  cursorPosition?: { line: number; column: number };
}

export type SupportedLanguage = 
  | 'typescript' 
  | 'javascript' 
  | 'json' 
  | 'css' 
  | 'html' 
  | 'markdown' 
  | 'plaintext';

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileTreeNode[];
  isExpanded?: boolean;
}
