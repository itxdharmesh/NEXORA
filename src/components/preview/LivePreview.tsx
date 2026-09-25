import React, { useEffect, useState, useRef } from 'react';
import { MemoryFS } from '../../core/filesystem/MemoryFS';
import { VirtualBundler } from '../../core/preview/Bundler';
import { ConsoleMessage } from '../../core/preview/ConsoleInterceptor';
import { ViewportControls, ViewportMode } from './ViewportControls';

interface LivePreviewProps {
  fs: MemoryFS;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ fs }) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [logs, setLogs] = useState<ConsoleMessage[]>([]);
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const recompileAndRender = () => {
    const bundler = new VirtualBundler(fs);
    const htmlBundle = bundler.bundleProject();

    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlBundle);
        doc.close();
      }
    }
  };

  useEffect(() => {
    recompileAndRender();
    const unsubscribe = fs.subscribe(() => recompileAndRender());

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NEXORA_CONSOLE_LOG') {
        setLogs((prev) => [...prev.slice(-100), event.data.payload]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [fs]);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#010409] overflow-hidden">
      <ViewportControls
        mode={viewport}
        onModeChange={setViewport}
        onRefresh={recompileAndRender}
      />

      {/* Sandboxed Execution Canvas */}
      <div className="flex-1 flex justify-center items-center bg-[#0d1117] p-2 overflow-auto">
        <iframe
          ref={iframeRef}
          title="NEXORA Live Preview"
          sandbox="allow-scripts allow-same-origin allow-modals"
          className={`h-full bg-white rounded-md shadow-2xl transition-all duration-300 border border-[#30363d] ${getViewportWidth()}`}
        />
      </div>

      {/* Intercepted Console Log Drawer */}
      <div className="border-t border-[#21262d] bg-[#161b22]">
        <div
          onClick={() => setShowConsole(!showConsole)}
          className="flex items-center justify-between px-3 py-1.5 cursor-pointer select-none text-xs text-[#8b949e] hover:bg-[#21262d]"
        >
          <span className="font-mono font-semibold flex items-center space-x-2">
            <span>💻 Application Console</span>
            {logs.some((l) => l.type === 'error') && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#da3633] text-white text-[10px]">
                {logs.filter((l) => l.type === 'error').length} Errors
              </span>
            )}
          </span>
          <span>{showConsole ? '▼' : '▲'}</span>
        </div>

        {showConsole && (
          <div className="h-36 overflow-y-auto p-2 font-mono text-[11px] bg-[#0d1117] space-y-1">
            {logs.length === 0 ? (
              <div className="text-[#8b949e] italic">Console ready. No log outputs recorded.</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-2 ${
                    log.type === 'error'
                      ? 'text-[#f85149]'
                      : log.type === 'warn'
                      ? 'text-[#d29922]'
                      : 'text-[#c9d1d9]'
                  }`}
                >
                  <span className="text-[#8b949e] select-none">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="uppercase font-bold text-[10px] select-none">[{log.type}]</span>
                  <span className="flex-1 whitespace-pre-wrap">{log.args.join(' ')}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
