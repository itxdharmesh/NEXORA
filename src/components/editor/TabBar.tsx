import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { MemoryFS } from '../../core/filesystem/MemoryFS';

interface TabBarProps {
  fs: MemoryFS;
}

export const TabBar: React.FC<TabBarProps> = ({ fs }) => {
  const { tabs, activeTabId, setActiveTab, closeTab, saveActiveTab } = useEditorStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-[#0d1117] border-b border-[#21262d] overflow-x-auto scrollbar-none select-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center h-9 px-3 border-r border-[#21262d] text-xs cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#161b22] text-[#c9d1d9] font-medium border-t-2 border-t-[#58a6ff]'
                : 'text-[#8b949e] hover:bg-[#161b22]/50 hover:text-[#c9d1d9]'
            }`}
          >
            <span className="mr-2 text-[10px] opacity-70 font-mono">
              {tab.extension.toUpperCase()}
            </span>
            <span className="truncate max-w-[120px]">{tab.name}</span>

            {/* Unsaved dirty dot indicator */}
            {tab.isDirty && (
              <span className="ml-2 w-2 h-2 rounded-full bg-[#d29922] group-hover:hidden" />
            )}

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={`ml-2 p-0.5 rounded hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] ${
                tab.isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
