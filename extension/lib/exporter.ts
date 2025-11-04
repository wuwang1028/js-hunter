// JS Hunter - Export Module

import type { AnalysisResult, JSFile } from '../types';

/**
 * 导出器类
 */
export class Exporter {
  /**
   * 导出为JSON
   */
  static exportJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导出为HTML报告
   */
  static exportHTML(result: AnalysisResult, file: JSFile): string {
    const findings = result.findings || [];
    const summary = result.summary || '';
    
    const severityColors: Record<string, string> = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#3b82f6',
      info: '#6b7280',
    };

    const severityLabels: Record<string, string> = {
      critical: '严重',
      high: '高危',
      medium: '中危',
      low: '低危',
      info: '信息',
    };

    const findingsHTML = findings
      .map(
        (finding: any) => `
      <div class="finding ${finding.severity}">
        <div class="finding-header">
          <h3>${this.escapeHtml(finding.title)}</h3>
          <span class="badge ${finding.severity}" style="background-color: ${severityColors[finding.severity] || '#6b7280'}">
            ${severityLabels[finding.severity] || finding.severity}
          </span>
        </div>
        <p class="description">${this.escapeHtml(finding.description)}</p>
        ${
          finding.code
            ? `
          <div class="code-block">
            <div class="code-header">代码片段</div>
            <pre><code>${this.escapeHtml(finding.code)}</code></pre>
          </div>
        `
            : ''
        }
        ${
          finding.location
            ? `<p class="location"><strong>位置:</strong> ${this.escapeHtml(finding.location)}</p>`
            : ''
        }
        ${
          finding.recommendation
            ? `<p class="recommendation"><strong>建议:</strong> ${this.escapeHtml(finding.recommendation)}</p>`
            : ''
        }
      </div>
    `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JS Hunter 分析报告 - ${this.escapeHtml(file.url)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .header p {
      opacity: 0.9;
      font-size: 0.875rem;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem 2rem;
      background: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .meta-value {
      font-weight: 600;
      color: #1f2937;
    }

    .content {
      padding: 2rem;
    }

    .summary {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      margin-bottom: 2rem;
      border-radius: 4px;
    }

    .summary h2 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #1e40af;
    }

    .findings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .findings-header h2 {
      font-size: 1.5rem;
      color: #1f2937;
    }

    .findings-count {
      background: #667eea;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .finding {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: box-shadow 0.2s;
    }

    .finding:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .finding.critical {
      border-left: 4px solid #dc2626;
    }

    .finding.high {
      border-left: 4px solid #ea580c;
    }

    .finding.medium {
      border-left: 4px solid #f59e0b;
    }

    .finding.low {
      border-left: 4px solid #3b82f6;
    }

    .finding.info {
      border-left: 4px solid #6b7280;
    }

    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .finding-header h3 {
      font-size: 1.125rem;
      color: #1f2937;
      flex: 1;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .description {
      color: #4b5563;
      margin-bottom: 1rem;
    }

    .code-block {
      background: #1f2937;
      border-radius: 6px;
      overflow: hidden;
      margin: 1rem 0;
    }

    .code-header {
      background: #374151;
      color: #9ca3af;
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .code-block pre {
      padding: 1rem;
      overflow-x: auto;
    }

    .code-block code {
      color: #e5e7eb;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .location {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .recommendation {
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      padding: 0.75rem;
      margin-top: 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .footer {
      background: #f9fafb;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      border-top: 1px solid #e5e7eb;
    }

    .no-findings {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .no-findings svg {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .container {
        box-shadow: none;
      }

      .finding {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 JS Hunter 分析报告</h1>
      <p>JavaScript 安全分析工具 - 渗透测试专用</p>
    </div>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">文件名</div>
        <div class="meta-value">${this.escapeHtml(file.url)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">文件大小</div>
        <div class="meta-value">${this.formatBytes(file.size)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">分析时间</div>
        <div class="meta-value">${new Date(result.analyzedAt).toLocaleString('zh-CN')}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">发现数量</div>
        <div class="meta-value">${findings.length} 项</div>
      </div>
    </div>

    <div class="content">
      ${
        summary
          ? `
        <div class="summary">
          <h2>📋 分析摘要</h2>
          <p>${this.escapeHtml(summary)}</p>
        </div>
      `
          : ''
      }

      <div class="findings-header">
        <h2>🎯 发现详情</h2>
        <div class="findings-count">${findings.length} 项发现</div>
      </div>

      ${
        findings.length > 0
          ? findingsHTML
          : `
        <div class="no-findings">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>未发现安全问题</p>
        </div>
      `
      }
    </div>

    <div class="footer">
      <p>生成时间: ${new Date().toLocaleString('zh-CN')} | JS Hunter v1.0.0</p>
      <p>此报告由 JS Hunter 自动生成，仅供安全测试参考</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 导出为Markdown
   */
  static exportMarkdown(result: AnalysisResult, file: JSFile): string {
    const findings = result.findings || [];
    const summary = result.summary || '';

    const severityEmojis: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: '⚪',
    };

    const severityLabels: Record<string, string> = {
      critical: '严重',
      high: '高危',
      medium: '中危',
      low: '低危',
      info: '信息',
    };

    let markdown = `# 🔍 JS Hunter 分析报告\n\n`;
    markdown += `**文件名:** ${file.url}\n`;
    markdown += `**文件大小:** ${this.formatBytes(file.size)}\n`;
    markdown += `**分析时间:** ${new Date(result.analyzedAt).toLocaleString('zh-CN')}\n`;
    markdown += `**发现数量:** ${findings.length} 项\n\n`;

    markdown += `---\n\n`;

    if (summary) {
      markdown += `## 📋 分析摘要\n\n`;
      markdown += `${summary}\n\n`;
    }

    markdown += `## 🎯 发现详情\n\n`;

    if (findings.length === 0) {
      markdown += `✅ 未发现安全问题\n\n`;
    } else {
      findings.forEach((finding: any, index: number) => {
        const emoji = severityEmojis[finding.severity] || '⚪';
        const label = severityLabels[finding.severity] || finding.severity;

        markdown += `### ${index + 1}. ${emoji} ${finding.title}\n\n`;
        markdown += `**严重程度:** ${label}\n\n`;
        markdown += `**描述:** ${finding.description}\n\n`;

        if (finding.code) {
          markdown += `**代码片段:**\n\n\`\`\`javascript\n${finding.code}\n\`\`\`\n\n`;
        }

        if (finding.location) {
          markdown += `**位置:** ${finding.location}\n\n`;
        }

        if (finding.recommendation) {
          markdown += `**建议:** ${finding.recommendation}\n\n`;
        }

        markdown += `---\n\n`;
      });
    }

    markdown += `## 📊 统计信息\n\n`;
    const stats = this.calculateStats(findings);
    markdown += `- 严重: ${stats.critical}\n`;
    markdown += `- 高危: ${stats.high}\n`;
    markdown += `- 中危: ${stats.medium}\n`;
    markdown += `- 低危: ${stats.low}\n`;
    markdown += `- 信息: ${stats.info}\n\n`;

    markdown += `---\n\n`;
    markdown += `*生成时间: ${new Date().toLocaleString('zh-CN')} | JS Hunter v1.0.0*\n`;

    return markdown;
  }

  /**
   * 导出为CSV
   */
  static exportCSV(results: AnalysisResult[]): string {
    const headers = ['文件名', '严重程度', '标题', '描述', '位置', '分析时间'];
    const rows = [headers.join(',')];

    results.forEach((result) => {
      const findings = result.findings || [];
      findings.forEach((finding: any) => {
        const row = [
          this.escapeCSV(result.fileName || ''),
          this.escapeCSV(finding.severity || ''),
          this.escapeCSV(finding.title || ''),
          this.escapeCSV(finding.description || ''),
          this.escapeCSV(finding.location || ''),
          new Date(result.analyzedAt).toLocaleString('zh-CN'),
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  /**
   * 下载文件
   */
  static download(content: string, filename: string, mimeType: string) {
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

  /**
   * 工具方法
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private static escapeCSV(text: string): string {
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private static calculateStats(findings: any[]): Record<string, number> {
    const stats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    findings.forEach((finding) => {
      const severity = finding.severity?.toLowerCase() || 'info';
      if (severity in stats) {
        stats[severity as keyof typeof stats]++;
      }
    });

    return stats;
  }
}
