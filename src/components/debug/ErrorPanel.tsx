import React, { useState, useEffect } from 'react';
import { MemoryFS } from '../../core/filesystem/MemoryFS';
import { ErrorPipeline, InterceptedError } from '../../core/debug/ErrorPipeline';
import { SelfHealingController } from '../../core/debug/SelfHealingController';

interface ErrorPanelProps {
  fs: MemoryFS;
  controller: SelfHealingController;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ fs, controller }) => {
  const [errors, setErrors] = useState<InterceptedError[]>([]);
  const [autoFixEnabled, setAutoFixEnabled] = useState<boolean>(true);

  useEffect(() => {
    const pipeline = controller.getPipeline();
    const unsubscribe = pipeline.subscribe((newError) => {
      setErrors((prev) => [newError, ...prev]);
    });
    return () => unsubscribe();
  }, [controller]);

  const toggleAutoFix = () => {
    const nextState = !autoFixEnabled;
    setAutoFixEnabled(nextState);
    controller.setAutoApply(nextState);
  };

  return (
    <div className="bg-[#161b22] border-t border-[#21262d] text-xs font-sans text-[#c9d1d9] p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base">🩹</span>
          <span className="font-bold text-white">NEXORA Self-Healing Engine</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">
            Active
          </span>
        </div>

        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoFixEnabled}
            onChange={toggleAutoFix}
            className="rounded bg-[#0d1117] border-[#30363d] text-[#58a6ff] focus:ring-0"
          />
          <span className="text-[#8b949e]">Auto-Apply Patches</span>
        </label>
      </div>

      {/* Errors Feed */}
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
        {errors.length === 0 ? (
          <div className="text-[#8b949e] italic text-center py-2">
            No runtime errors detected. Workspace is stable.
          </div>
        ) : (
          errors.map((err) => (
            <div
              key={err.id}
              className="p-2.5 bg-[#0d1117] border border-[#da3633]/40 rounded-md flex items-start justify-between space-x-3"
            >
              <div className="space-y-1 truncate">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#f85149] uppercase text-[10px]">{err.source}</span>
                  <span className="font-mono text-[11px] text-[#c9d1d9] truncate">{err.message}</span>
                </div>
                <div className="text-[10px] text-[#8b949e] font-mono">
                  Target: {err.file || 'src/App.tsx'}
                </div>
              </div>

              <span className="px-2 py-0.5 text-[10px] rounded bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/40">
                Auto-Patched
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
