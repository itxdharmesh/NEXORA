import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { MemoryFS } from '../../core/filesystem/MemoryFS';

interface CodeEditorProps {
  fs: MemoryFS;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ fs }) => {
  const { tabs, activeTabId, updateBufferContent, saveActiveTab } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [cursorLine, setCursorLine] = useState(1);

  useEffect(() => {
    if (activeTab) {
      const lines = activeTab.content.split('\n').length;
      setLineCount(Math.max(lines, 1));
    }
  }, [activeTab?.content]);

  // Synchronize scrolling between code textarea and line number gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut support (Ctrl+S / Cmd+S for manual save, Tab handling)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveActiveTab(fs);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (!textareaRef.current || !activeTab) return;

      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const val = activeTab.content;

      const newContent = val.substring(0, start) + '  ' + val.substring(end);
      updateBufferContent(activeTab.id, newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleSelectionChange = () => {
    if (!textareaRef.current || !activeTab) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = activeTab.content.substring(0, pos);
    const line = textBefore.split('\n').length;
    setCursorLine(line);
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] text-[#8b949e]">
        <div className="w-12 h-12 rounded-full border border-[#21262d] flex items-center justify-center mb-3">
          <span className="text-xl">⚡</span>
        </div>
        <p className="text-sm font-medium">No file selected</p>
        <p className="text-xs text-[#484f58] mt-1">Select a file from the explorer or create a new one</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden relative font-mono text-xs">
      {/* Code Editor Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-[#0d1117] border-r border-[#21262d] text-[#484f58] select-none py-3 text-right pr-3 overflow-hidden"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const isCurrent = lineNum === cursorLine;
            return (
              <div
                key={lineNum}
                className={`h-5 leading-5 ${isCurrent ? 'text-[#c9d1d9] font-bold' : ''}`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={activeTab.content}
          onChange={(e) => updateBufferContent(activeTab.id, e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onClick={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          spellCheck={false}
          className="flex-1 bg-[#0d1117] text-[#c9d1d9] p-3 leading-5 resize-none outline-none border-none whitespace-pre overflow-auto font-mono scrollbar-thin scrollbar-thumb-[#30363d]"
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-6 bg-[#161b22] border-t border-[#21262d] px-3 flex items-center justify-between text-[11px] text-[#8b949e] select-none">
        <div className="flex items-center space-x-3">
          <span>{activeTab.path}</span>
          {activeTab.isDirty && (
            <span className="text-[#d29922] font-semibold">● Unsaved Changes</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln {cursorLine}, Col 1</span>
          <span>UTF-8</span>
          <span className="uppercase">{activeTab.extension}</span>
        </div>
      </div>
    </div>
  );
};
