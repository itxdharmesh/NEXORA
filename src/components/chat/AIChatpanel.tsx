import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../../store/useAgentStore';
import { MemoryFS } from '../../core/filesystem/MemoryFS';

interface AIChatPanelProps {
  fs: MemoryFS;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ fs }) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const { messages, isProcessing, currentAgentRole, submitPrompt } = useAgentStore();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;
    const p = inputPrompt;
    setInputPrompt('');
    submitPrompt(p, fs);
  };

  return (
    <div className="w-80 bg-[#0d1117] border-l border-[#21262d] flex flex-col h-full font-sans text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="font-bold text-[#c9d1d9] tracking-wide">NEXORA AI</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-[#21262d] text-[#58a6ff] font-mono">
          {currentAgentRole}
        </span>
      </div>

      {/* Message Stream Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#30363d]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-lg border text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#1f6feb]/20 border-[#1f6feb]/40 text-[#f0f6fc]'
                    : 'bg-[#161b22] border-[#30363d] text-[#c9d1d9]'
                }`}
              >
                {!isUser && msg.agentRole && (
                  <div className="text-[10px] font-mono text-[#8b949e] mb-1">
                    Agent: <span className="text-[#58a6ff]">{msg.agentRole}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Tool Activity Timeline */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#21262d] space-y-1.5 font-mono text-[11px]">
                    {msg.toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-center justify-between bg-[#0d1117] p-1.5 rounded border border-[#21262d]"
                      >
                        <span className="text-[#8b949e]">
                          ⚡ {tc.name} ({tc.args.path || 'args'})
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            tc.status === 'success'
                              ? 'text-[#3fb950]'
                              : tc.status === 'running'
                              ? 'text-[#d29922]'
                              : 'text-[#f85149]'
                          }`}
                        >
                          {tc.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Mutations Summary Badge */}
                {msg.fileChanges && (
                  <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono">
                    {msg.fileChanges.created.length > 0 && (
                      <span className="text-[#3fb950]">+{msg.fileChanges.created.length} created</span>
                    )}
                    {msg.fileChanges.modified.length > 0 && (
                      <span className="text-[#d29922]">~{msg.fileChanges.modified.length} modified</span>
                    )}
                    {msg.fileChanges.deleted.length > 0 && (
                      <span className="text-[#f85149]">-{msg.fileChanges.deleted.length} removed</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#21262d] bg-[#161b22]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Describe an app or feature to build..."
            disabled={isProcessing}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] text-[#c9d1d9] pl-3 pr-10 py-2 rounded-md outline-none text-xs transition-colors"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputPrompt.trim()}
            className="absolute right-1.5 p-1 rounded bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white text-xs"
          >
            {isProcessing ? '⏳' : '➔'}
          </button>
        </div>
      </form>
    </div>
  );
};
