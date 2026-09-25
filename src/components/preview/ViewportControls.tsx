import React from 'react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface ViewportControlsProps {
  mode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  onRefresh: () => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({ mode, onModeChange, onRefresh }) => {
  return (
    <div className="flex items-center space-x-2 bg-[#161b22] px-3 py-1.5 border-b border-[#21262d] text-xs text-[#8b949e]">
      <span className="font-semibold text-[#c9d1d9] mr-2">Viewport:</span>
      <button
        onClick={() => onModeChange('desktop')}
        className={`px-2.5 py-1 rounded transition-colors ${
          mode === 'desktop' ? 'bg-[#21262d] text-[#58a6ff]' : 'hover:text-[#c9d1d9]'
        }`}
      >
        🖥️ Responsive (100%)
      </button>
      <button
        onClick={() => onModeChange('tablet')}
        className={`px-2.5 py-1 rounded transition-colors ${
          mode === 'tablet' ? 'bg-[#21262d] text-[#58a6ff]' : 'hover:text-[#c9d1d9]'
        }`}
      >
        📱 Tablet (768px)
      </button>
      <button
        onClick={() => onModeChange('mobile')}
        className={`px-2.5 py-1 rounded transition-colors ${
          mode === 'mobile' ? 'bg-[#21262d] text-[#58a6ff]' : 'hover:text-[#c9d1d9]'
        }`}
      >
        📲 Mobile (375px)
      </button>

      <div className="ml-auto flex items-center space-x-2">
        <button
          onClick={onRefresh}
          className="p-1 hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] rounded transition-colors"
          title="Reload Preview"
        >
          🔄 Reload
        </button>
      </div>
    </div>
  );
};
