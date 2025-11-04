// JS Hunter - Code Syntax Highlighter

/**
 * 简单的JavaScript语法高亮器
 */
export class Highlighter {
  private static keywords = [
    'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
    'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
    'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final',
    'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
    'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new',
    'null', 'package', 'private', 'protected', 'public', 'return', 'short',
    'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
    'with', 'yield', 'async', 'of',
  ];

  private static builtins = [
    'Array', 'Date', 'eval', 'function', 'hasOwnProperty', 'Infinity',
    'isFinite', 'isNaN', 'isPrototypeOf', 'length', 'Math', 'NaN', 'name',
    'Number', 'Object', 'prototype', 'String', 'toString', 'undefined', 'valueOf',
    'console', 'window', 'document', 'navigator', 'location', 'localStorage',
    'sessionStorage', 'Promise', 'Set', 'Map', 'WeakMap', 'WeakSet', 'Symbol',
    'Proxy', 'Reflect', 'JSON', 'parseInt', 'parseFloat', 'encodeURI',
    'decodeURI', 'encodeURIComponent', 'decodeURIComponent', 'setTimeout',
    'setInterval', 'clearTimeout', 'clearInterval', 'fetch', 'XMLHttpRequest',
  ];

  /**
   * 高亮JavaScript代码
   */
  static highlight(code: string): string {
    let html = this.escapeHtml(code);

    // 1. 高亮注释
    html = html.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

    // 2. 高亮字符串
    html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="string">$1</span>');
    html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="string">$1</span>');
    html = html.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="string">$1</span>');

    // 3. 高亮数字
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

    // 4. 高亮关键字
    this.keywords.forEach((keyword) => {
      const pattern = new RegExp(`\\b(${keyword})\\b`, 'g');
      html = html.replace(pattern, '<span class="keyword">$1</span>');
    });

    // 5. 高亮内置对象和函数
    this.builtins.forEach((builtin) => {
      const pattern = new RegExp(`\\b(${builtin})\\b`, 'g');
      html = html.replace(pattern, '<span class="builtin">$1</span>');
    });

    // 6. 高亮函数调用
    html = html.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="function">$1</span>(');

    // 7. 高亮操作符
    const operators = ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^', '~', '<<', '>>', '>>>', '?', ':'];
    operators.forEach((op) => {
      const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(escaped, 'g'), `<span class="operator">${op}</span>`);
    });

    return html;
  }

  /**
   * 生成带行号的HTML
   */
  static highlightWithLineNumbers(code: string): string {
    const lines = code.split('\n');
    const maxLineNumber = lines.length.toString().length;

    const html = lines
      .map((line, index) => {
        const lineNumber = (index + 1).toString().padStart(maxLineNumber, ' ');
        const highlightedLine = this.highlight(line);
        return `<div class="line"><span class="line-number">${lineNumber}</span><span class="line-content">${highlightedLine}</span></div>`;
      })
      .join('');

    return `<div class="code-viewer">${html}</div>`;
  }

  /**
   * 生成完整的HTML文档
   */
  static generateHTMLDocument(code: string, title: string = 'Code Viewer'): string {
    const highlightedCode = this.highlightWithLineNumbers(code);

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.5;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
    }

    .code-viewer {
      background: #1e1e1e;
      border: 1px solid #3e3e3e;
      border-radius: 4px;
      overflow: auto;
    }

    .line {
      display: flex;
      padding: 2px 0;
    }

    .line:hover {
      background: #2d2d2d;
    }

    .line-number {
      display: inline-block;
      min-width: 50px;
      padding: 0 10px;
      text-align: right;
      color: #858585;
      user-select: none;
      border-right: 1px solid #3e3e3e;
      margin-right: 10px;
    }

    .line-content {
      flex: 1;
      white-space: pre;
      padding-right: 10px;
    }

    /* 语法高亮样式 */
    .keyword {
      color: #569cd6;
      font-weight: bold;
    }

    .string {
      color: #ce9178;
    }

    .number {
      color: #b5cea8;
    }

    .comment {
      color: #6a9955;
      font-style: italic;
    }

    .function {
      color: #dcdcaa;
    }

    .builtin {
      color: #4ec9b0;
    }

    .operator {
      color: #d4d4d4;
    }

    .header {
      background: #252526;
      padding: 15px 20px;
      border: 1px solid #3e3e3e;
      border-radius: 4px 4px 0 0;
      margin-bottom: -1px;
    }

    .header h1 {
      font-size: 18px;
      color: #cccccc;
    }

    .stats {
      margin-top: 10px;
      font-size: 12px;
      color: #858585;
    }

    .stats span {
      margin-right: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHtml(title)}</h1>
    <div class="stats">
      <span>📄 Lines: ${code.split('\n').length}</span>
      <span>📝 Characters: ${code.length}</span>
      <span>💾 Size: ${this.formatBytes(code.length)}</span>
    </div>
  </div>
  ${highlightedCode}
</body>
</html>`;
  }

  /**
   * 转义HTML
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 格式化字节大小
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 获取CSS样式
   */
  static getCSS(): string {
    return `
.code-viewer {
  background: #1e1e1e;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.line {
  display: flex;
  padding: 2px 0;
}

.line:hover {
  background: #2d2d2d;
}

.line-number {
  display: inline-block;
  min-width: 50px;
  padding: 0 10px;
  text-align: right;
  color: #858585;
  user-select: none;
  border-right: 1px solid #3e3e3e;
  margin-right: 10px;
}

.line-content {
  flex: 1;
  white-space: pre;
  padding-right: 10px;
  color: #d4d4d4;
}

.keyword { color: #569cd6; font-weight: bold; }
.string { color: #ce9178; }
.number { color: #b5cea8; }
.comment { color: #6a9955; font-style: italic; }
.function { color: #dcdcaa; }
.builtin { color: #4ec9b0; }
.operator { color: #d4d4d4; }
`;
  }
}
