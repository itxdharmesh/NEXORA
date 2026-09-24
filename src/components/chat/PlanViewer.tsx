import React, { useEffect, useState } from 'react';
import { MemoryFS } from '../../core/filesystem/MemoryFS';
import { ProjectMemoryManager } from '../../core/memory/ProjectMemoryManager';
import { PlanStep } from '../../types/memory';

interface PlanViewerProps {
  fs: MemoryFS;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ fs }) => {
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [activeTab, setActiveTab] = useState<'plan' | 'decisions' | 'errors'>('plan');
  const [rawContent, setRawContent] = useState('');

  const refreshMemoryState = () => {
    const manager = new ProjectMemoryManager(fs);
    setSteps(manager.parsePlanSteps());

    if (activeTab === 'plan') {
      setRawContent(fs.readFile('/.nexora/plan.md') || 'No active plan found.');
    } else if (activeTab === 'decisions') {
      setRawContent(fs.readFile('/.nexora/decisions.md') || 'No decisions recorded yet.');
    } else {
      setRawContent(fs.readFile('/.nexora/errors.md') || 'No active runtime errors.');
    }
  };

  useEffect(() => {
    refreshMemoryState();
    const unsubscribe = fs.subscribe(() => refreshMemoryState());
    return () => unsubscribe();
  }, [fs, activeTab]);

  const getStatusBadge = (status: PlanStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">✓ COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-[#9e6a03]/20 text-[#d29922] border border-[#9e6a03]/40 animate-pulse">⏳ IN PROGRESS</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/40">🚫 BLOCKED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-[#21262d] text-[#8b949e]">PENDING</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] font-sans text-xs text-[#c9d1d9] overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex items-center bg-[#161b22] border-b border-[#21262d] px-3 h-9">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === 'plan' ? 'border-[#58a6ff] text-[#58a6ff]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          📋 Execution Plan & Progress
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          className={`px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === 'decisions' ? 'border-[#58a6ff] text-[#58a6ff]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          🧠 Architectural Decisions
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === 'errors' ? 'border-[#58a6ff] text-[#58a6ff]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          🐞 Error Log
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#30363d]">
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
              <h3 className="text-sm font-bold text-white mb-1">Agent Memory Tracking State</h3>
              <p className="text-[#8b949e]">
                Persisted in <code className="text-[#58a6ff]">/.nexora/progress.md</code>. Agent reads state before processing edits.
              </p>
            </div>

            {/* Parsed Steps List */}
            <div className="space-y-2">
              {steps.length === 0 ? (
                <div className="text-[#8b949e] italic py-4 text-center">No tasks recorded in memory progress log.</div>
              ) : (
                steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-2.5 bg-[#161b22]/60 border border-[#21262d] rounded-md hover:border-[#30363d] transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <span className="text-base">{step.status === 'COMPLETED' ? '✅' : '🔹'}</span>
                      <span className="font-medium text-[#c9d1d9] truncate">{step.title}</span>
                    </div>
                    <div>{getStatusBadge(step.status)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Raw Markdown Output Preview */}
            <div className="mt-6 border-t border-[#21262d] pt-4">
              <h4 className="text-xs font-mono text-[#8b949e] mb-2 uppercase tracking-wider">Raw .nexora/plan.md Buffer</h4>
              <pre className="p-3 bg-[#010409] border border-[#21262d] rounded font-mono text-[11px] text-[#8b949e] whitespace-pre-wrap">
                {rawContent}
              </pre>
            </div>
          </div>
        )}

        {(activeTab === 'decisions' || activeTab === 'errors') && (
          <pre className="p-4 bg-[#010409] border border-[#21262d] rounded font-mono text-xs text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
            {rawContent}
          </pre>
        )}
      </div>
    </div>
  );
};
w
