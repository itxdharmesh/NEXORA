import { AIModelAdapter, AgentMessage, CompletionResponse } from './AIModelAdapter';

export class MockStreamingAdapter implements AIModelAdapter {
  public providerName = 'Nexora-Local-Driver';
  public modelName = 'nexora-agent-v1';

  public async generateCompletion(
    messages: AgentMessage[],
    onChunk?: (textChunk: string) => void,
    onToolCall?: (toolCall: any) => void
  ): Promise<CompletionResponse> {
    const userPrompt = messages[messages.length - 1]?.content || '';

    // Step 1: Stream conversational AI thinking text
    const introText = `I have processed your request: "${userPrompt}". I am now generating the project architecture, updating state in .nexora/, and generating code files.\n\n`;
    for (let i = 0; i < introText.length; i += 4) {
      const chunk = introText.slice(i, i + 4);
      if (onChunk) onChunk(chunk);
      await new Promise((r) => setTimeout(r, 15));
    }

    // Step 2: Determine simulated project files based on user prompt keywords
    const toolCalls: any[] = [];

    // System Progress & Plan Tool Calls
    toolCalls.push({
      id: `tc-${Date.now()}-1`,
      name: 'write_file',
      arguments: {
        path: '/.nexora/plan.md',
        content: `# NEXORA Architectural Plan\n\n- Prompt: ${userPrompt}\n- Strategy: Modular Component Architecture\n- Framework: React + TypeScript + Tailwind CSS`,
      },
    });

    if (userPrompt.toLowerCase().includes('football') || userPrompt.toLowerCase().includes('social')) {
      toolCalls.push({
        id: `tc-${Date.now()}-2`,
        name: 'write_file',
        arguments: {
          path: '/src/components/Feed.tsx',
          content: `import React from 'react';\n\nexport const FootballFeed = () => (\n  <div className="p-4 bg-gray-900 text-white rounded-lg">\n    <h2 className="text-xl font-bold mb-2">⚽ Live Match Feed</h2>\n    <p className="text-sm text-gray-400">Match updates and social posts will appear here.</p>\n  </div>\n);`,
        },
      });
    }

    // Default App.tsx replacement/mutation
    toolCalls.push({
      id: `tc-${Date.now()}-3`,
      name: 'write_file',
      arguments: {
        path: '/src/App.tsx',
        content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-8 font-sans">\n      <header className="mb-8 border-b border-[#21262d] pb-4">\n        <h1 className="text-3xl font-extrabold tracking-tight text-[#58a6ff]">NEXORA Generated App</h1>\n        <p className="text-sm text-[#8b949e] mt-1">Prompt: "${userPrompt}"</p>\n      </header>\n      <main className="max-w-4xl mx-auto space-y-6">\n        <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl">\n          <h2 className="text-lg font-semibold text-white mb-2">System Status</h2>\n          <p className="text-xs text-[#8b949e]">Application synthesized and executing cleanly in virtual memory.</p>\n        </div>\n      </main>\n    </div>\n  );\n}`,
      },
    });

    // Stream out tool execution events
    for (const tc of toolCalls) {
      if (onToolCall) onToolCall(tc);
      await new Promise((r) => setTimeout(r, 120));
    }

    return {
      content: introText,
      toolCalls,
    };
  }
}
