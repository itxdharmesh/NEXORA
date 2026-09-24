import React, { useState } from 'react';
import { MemoryFS, FileNode } from '../../core/filesystem/MemoryFS';
import { useEditorStore } from '../../store/useEditorStore';

interface FileExplorerProps {
  fs: MemoryFS;
  tree: FileNode[];
  onRefresh: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ fs, tree, onRefresh }) => {
  const { openFile, activeTabId } = useEditorStore();
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ '/': true });
  const [newFileInput, setNewFileInput] = useState<{ parentPath: string; isFolder: boolean } | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const toggleDirectory = (path: string) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreateNode = () => {
    if (!newFileInput || !newItemName.trim()) return;
    const fullPath = `${newFileInput.parentPath === '/' ? '' : newFileInput.parentPath}/${newItemName.trim()}`;
    
    if (newFileInput.isFolder) {
      fs.writeFile(`${fullPath}/.gitkeep`, '');
    } else {
      fs.writeFile(fullPath, '');
      openFile(fullPath, fs);
    }

    setNewFileInput(null);
    setNewItemName('');
    onRefresh();
  };

  const handleDelete = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      fs.deleteNode(path);
      onRefresh();
    }
  };

  const renderTree = (nodes: FileNode[]) => {
    return nodes.map((node) => {
      const isDir = node.type === 'directory';
      const isExpanded = expandedDirs[node.path];
      const isActive = activeTabId === node.path;

      return (
        <div key={node.path} className="select-none text-xs">
          <div
            onClick={() => {
              if (isDir) toggleDirectory(node.path);
              else openFile(node.path, fs);
            }}
            className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#21262d] text-[#58a6ff] font-medium'
                : 'text-[#c9d1d9] hover:bg-[#161b22]'
            }`}
          >
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-[10px] text-[#8b949e]">
                {isDir ? (isExpanded ? '📂' : '📁') : '📄'}
              </span>
              <span className="truncate">{node.name}</span>
            </div>

            {/* Quick Hover Action Triggers */}
            <div className="hidden group-hover:flex items-center space-x-1">
              {isDir && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewFileInput({ parentPath: node.path, isFolder: false });
                  }}
                  className="p-0.5 text-[10px] text-[#8b949e] hover:text-[#f0f6fc]"
                  title="New File"
                >
                  +📄
                </button>
              )}
              <button
                onClick={(e) => handleDelete(e, node.path)}
                className="p-0.5 text-[10px] text-[#8b949e] hover:text-[#f85149]"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>

          {/* New Node Creation Input */}
          {newFileInput?.parentPath === node.path && (
            <div className="pl-4 py-1 flex items-center space-x-1">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNode()}
                placeholder={newFileInput.isFolder ? 'folder-name' : 'file-name.ts'}
                autoFocus
                className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] px-1.5 py-0.5 text-xs rounded outline-none w-full"
              />
            </div>
          )}

          {/* Recursive Child Directory Render */}
          {isDir && isExpanded && node.children && (
            <div className="pl-3 border-l border-[#21262d] ml-2">
              {renderTree(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-60 bg-[#0d1117] border-r border-[#21262d] flex flex-col h-full">
      <div className="p-3 border-b border-[#21262d] flex items-center justify-between text-xs text-[#8b949e] uppercase font-semibold tracking-wider">
        <span>Explorer</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setNewFileInput({ parentPath: '/', isFolder: false })}
            className="p-1 hover:bg-[#21262d] rounded text-[#c9d1d9]"
            title="New File at Root"
          >
            +📄
          </button>
          <button
            onClick={() => setNewFileInput({ parentPath: '/', isFolder: true })}
            className="p-1 hover:bg-[#21262d] rounded text-[#c9d1d9]"
            title="New Folder at Root"
          >
            +📁
          </button>
        </div>
      </div>
      <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#30363d]">
        {renderTree(tree)}
      </div>
    </div>
  );
};
