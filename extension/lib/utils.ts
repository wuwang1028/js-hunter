// JS Hunter - Utility Functions

import type { JSFile, JSFileMetadata } from '../types/index';

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 计算字符串的SHA-256哈希
 */
export async function calculateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 从URL提取域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * 检测JS文件是否被压缩
 */
export function isMinified(content: string): boolean {
  const lines = content.split('\n');
  if (lines.length < 10) return false;

  // 检查平均行长度
  const avgLineLength =
    lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

  // 如果平均行长度超过200，可能是压缩的
  if (avgLineLength > 200) return true;

  // 检查是否有很少的换行符
  const charCount = content.length;
  const lineCount = lines.length;
  if (charCount > 1000 && lineCount < 20) return true;

  return false;
}

/**
 * 检测JS文件是否被混淆
 */
export function isObfuscated(content: string): boolean {
  // 检查常见的混淆特征
  const obfuscationPatterns = [
    /\\x[0-9a-f]{2}/gi, // 十六进制编码
    /\\u[0-9a-f]{4}/gi, // Unicode编码
    /_0x[0-9a-f]+/gi, // 常见混淆变量名
    /\['\\x[0-9a-f]{2}'\]/gi, // 数组访问混淆
  ];

  let matchCount = 0;
  for (const pattern of obfuscationPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 10) {
      matchCount++;
    }
  }

  return matchCount >= 2;
}

/**
 * 检测JavaScript框架
 */
export function detectFramework(
  content: string
): 'react' | 'vue' | 'angular' | 'svelte' | 'unknown' {
  if (
    content.includes('React.createElement') ||
    content.includes('react-dom') ||
    content.includes('jsx-runtime')
  ) {
    return 'react';
  }

  if (
    content.includes('Vue.component') ||
    content.includes('createApp') ||
    content.includes('vue-router')
  ) {
    return 'vue';
  }

  if (
    content.includes('@angular/core') ||
    content.includes('platformBrowserDynamic')
  ) {
    return 'angular';
  }

  if (content.includes('svelte') || content.includes('SvelteComponent')) {
    return 'svelte';
  }

  return 'unknown';
}

/**
 * 检测打包工具
 */
export function detectBundler(
  content: string
): 'webpack' | 'rollup' | 'vite' | 'parcel' | 'unknown' {
  if (
    content.includes('__webpack_require__') ||
    content.includes('webpackChunk')
  ) {
    return 'webpack';
  }

  if (content.includes('rollup') || content.includes('/*! Rollup')) {
    return 'rollup';
  }

  if (content.includes('vite') || content.includes('__vite')) {
    return 'vite';
  }

  if (content.includes('parcelRequire') || content.includes('$parcel$')) {
    return 'parcel';
  }

  return 'unknown';
}

/**
 * 检测Source Map URL
 */
export function detectSourceMapUrl(content: string): string | undefined {
  const sourceMapRegex = /\/\/[@#]\s*sourceMappingURL=([^\s]+)/;
  const match = content.match(sourceMapRegex);
  return match ? match[1] : undefined;
}

/**
 * 分析JS文件元数据
 */
export function analyzeMetadata(content: string, url?: string): JSFileMetadata {
  const lines = content.split('\n');
  const sourceMapUrl = detectSourceMapUrl(content);

  return {
    isMinified: isMinified(content),
    isObfuscated: isObfuscated(content),
    framework: detectFramework(content),
    bundler: detectBundler(content),
    hasSourceMap: !!sourceMapUrl,
    lineCount: lines.length,
  };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return `${seconds}秒前`;
}

/**
 * 美化JSON
 */
export function beautifyJSON(json: any): string {
  try {
    return JSON.stringify(json, null, 2);
  } catch {
    return String(json);
  }
}

/**
 * 美化JavaScript代码（简单版本）
 */
export function beautifyJS(code: string): string {
  // 这是一个简化版本，实际应该使用专业的格式化库
  let formatted = code;
  let indent = 0;
  const indentStr = '  ';
  const lines: string[] = [];

  // 简单的格式化逻辑
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];

    if (char === '{' || char === '[') {
      lines.push(indentStr.repeat(indent) + char);
      indent++;
    } else if (char === '}' || char === ']') {
      indent--;
      lines.push(indentStr.repeat(indent) + char);
    } else if (char === ';') {
      lines.push(char);
    } else {
      if (lines.length === 0) {
        lines.push('');
      }
      lines[lines.length - 1] += char;
    }
  }

  return lines.join('\n');
}

/**
 * 截取代码片段
 */
export function extractCodeSnippet(
  content: string,
  line: number,
  contextLines: number = 2
): string {
  const lines = content.split('\n');
  const start = Math.max(0, line - contextLines - 1);
  const end = Math.min(lines.length, line + contextLines);

  return lines
    .slice(start, end)
    .map((l, i) => {
      const lineNum = start + i + 1;
      const marker = lineNum === line ? '>' : ' ';
      return `${marker} ${lineNum.toString().padStart(4)} | ${l}`;
    })
    .join('\n');
}

/**
 * 验证URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查是否为JS文件URL
 */
export function isJSUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return (
      pathname.endsWith('.js') ||
      pathname.endsWith('.mjs') ||
      pathname.endsWith('.jsx') ||
      pathname.endsWith('.ts') ||
      pathname.endsWith('.tsx')
    );
  } catch {
    return false;
  }
}

/**
 * 解析Content-Type
 */
export function isJavaScriptContentType(contentType: string): boolean {
  const jsTypes = [
    'application/javascript',
    'application/x-javascript',
    'text/javascript',
    'text/ecmascript',
    'application/ecmascript',
  ];

  const normalized = contentType.toLowerCase().split(';')[0].trim();
  return jsTypes.includes(normalized);
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse<T = any>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * 压缩字符串（使用gzip）
 */
export async function compressString(str: string): Promise<Blob> {
  const stream = new Blob([str]).stream();
  const compressedStream = stream.pipeThrough(
    new CompressionStream('gzip')
  );
  return new Response(compressedStream).blob();
}

/**
 * 解压缩字符串
 */
export async function decompressString(blob: Blob): Promise<string> {
  const stream = blob.stream();
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream('gzip')
  );
  return new Response(decompressedStream).text();
}

/**
 * 限制字符串长度
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * 高亮搜索关键词
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 转义HTML
 */
export function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
