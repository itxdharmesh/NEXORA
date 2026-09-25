import { MemoryFS } from '../filesystem/MemoryFS';
import { generateInterceptorScript } from './ConsoleInterceptor';

export class VirtualBundler {
  private fs: MemoryFS;

  constructor(fs: MemoryFS) {
    this.fs = fs;
  }

  public bundleProject(): string {
    const indexHtml = this.fs.readFile('/index.html') || this.getDefaultHtml();
    const mainJs = this.fs.readFile('/src/main.tsx') || this.fs.readFile('/src/main.js') || '';

    const interceptor = generateInterceptorScript();

    // Construct self-contained runtime page using CDN fallbacks for instant bundling
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>${interceptor}</script>
  <style>
    body { margin: 0; background-color: #0d1117; color: #c9d1d9; font-family: system-ui, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      ${mainJs}
    } catch (err) {
      console.error("Compilation / Execution Error:", err.message);
    }
  </script>
</body>
</html>
    `;
  }

  private getDefaultHtml(): string {
    return `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`;
  }
}
