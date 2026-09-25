export interface ConsoleMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  args: string[];
  timestamp: number;
}

export const generateInterceptorScript = (): string => `
(function() {
  const origin = window.location.origin;

  function sendToHost(type, args) {
    try {
      const serialized = args.map(arg => {
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch(e) { return String(arg); }
        }
        return String(arg);
      });
      window.parent.postMessage({
        type: 'NEXORA_CONSOLE_LOG',
        payload: {
          id: Math.random().toString(36).substring(2, 9),
          type,
          args: serialized,
          timestamp: Date.now()
        }
      }, '*');
    } catch (e) {
      // Fallback if message passing fails
    }
  }

  ['log', 'info', 'warn', 'error'].forEach(level => {
    const original = console[level];
    console[level] = function(...args) {
      sendToHost(level, args);
      if (original) original.apply(console, args);
    };
  });

  window.onerror = function(message, source, lineno, colno, error) {
    sendToHost('error', [\`Runtime Error: \${message} at \${lineno}:\${colno}\`]);
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    sendToHost('error', [\`Unhandled Promise Rejection: \${event.reason}\`]);
  });
})();
`;
