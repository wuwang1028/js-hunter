// JS Hunter Desktop - File Manager

import * as fs from 'fs/promises';
import * as path from 'path';
import { DatabaseManager } from './database';
import {
  generateUUID,
  calculateHash,
  extractDomain,
  analyzeMetadata,
} from '../shared/utils';
import type { JSFile } from '../shared/types';

export class FileManager {
  constructor(private dbManager: DatabaseManager) {}

  /**
   * 导入单个文件
   */
  async importFile(filePath: string): Promise<JSFile> {
    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');

    // 计算hash
    const hash = await calculateHash(content);

    // 检查是否已存在
    const existing = await this.dbManager.getJSFileByHash(hash);
    if (existing) {
      throw new Error('File already exists (duplicate hash)');
    }

    // 分析元数据
    const metadata = analyzeMetadata(content);

    // 创建JS文件对象
    const jsFile: JSFile = {
      id: generateUUID(),
      url: `file://${filePath}`,
      domain: 'local',
      type: 'external',
      content,
      size: content.length,
      hash,
      timestamp: Date.now(),
      metadata,
      filePath,
    } as JSFile;

    // 保存到数据库
    await this.dbManager.addJSFile(jsFile);

    return jsFile;
  }

  /**
   * 导入多个文件
   */
  async importFiles(filePaths: string[]): Promise<JSFile[]> {
    const results: JSFile[] = [];

    for (const filePath of filePaths) {
      try {
        const file = await this.importFile(filePath);
        results.push(file);
      } catch (error) {
        console.error(`Failed to import ${filePath}:`, error);
      }
    }

    return results;
  }

  /**
   * 导入文件夹
   */
  async importFolder(folderPath: string): Promise<JSFile[]> {
    const jsFiles = await this.findJSFiles(folderPath);
    return await this.importFiles(jsFiles);
  }

  /**
   * 递归查找JS文件
   */
  private async findJSFiles(dirPath: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // 跳过node_modules等目录
        if (entry.name === 'node_modules' || entry.name === '.git') {
          continue;
        }
        const subFiles = await this.findJSFiles(fullPath);
        results.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.mjs', '.jsx', '.ts', '.tsx'].includes(ext)) {
          results.push(fullPath);
        }
      }
    }

    return results;
  }

  /**
   * 导出数据
   */
  async exportData(filePath: string, format: string, data: any): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.json':
        await this.exportJSON(filePath, data);
        break;

      case '.html':
        await this.exportHTML(filePath, data);
        break;

      case '.md':
        await this.exportMarkdown(filePath, data);
        break;

      case '.pdf':
        // TODO: 实现PDF导出
        throw new Error('PDF export not implemented yet');

      default:
        throw new Error(`Unsupported export format: ${ext}`);
    }
  }

  /**
   * 导出为JSON
   */
  private async exportJSON(filePath: string, data: any): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, json, 'utf-8');
  }

  /**
   * 导出为HTML
   */
  private async exportHTML(filePath: string, data: any): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JS Hunter Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #00d4ff; margin-bottom: 20px; }
    h2 { color: #333; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #00d4ff; padding-bottom: 10px; }
    .summary { background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
    .stat { display: inline-block; margin-right: 30px; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: 600; color: #00d4ff; }
    .finding { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
    .finding-title { font-weight: 600; color: #333; margin-bottom: 8px; }
    .finding-severity { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600; }
    .severity-critical { background: #ff4444; color: white; }
    .severity-high { background: #ff8800; color: white; }
    .severity-medium { background: #ffaa00; color: white; }
    .severity-low { background: #00d4ff; color: white; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 JS Hunter Analysis Report</h1>
    <div class="summary">
      <div class="stat">
        <div class="stat-label">Total Files</div>
        <div class="stat-value">${data.files?.length || 0}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Total Findings</div>
        <div class="stat-value">${data.totalFindings || 0}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Critical</div>
        <div class="stat-value" style="color: #ff4444;">${data.criticalCount || 0}</div>
      </div>
    </div>

    <h2>📋 Analysis Results</h2>
    ${this.generateFindingsHTML(data.findings || [])}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 14px;">
      Generated by JS Hunter Desktop v1.0.0 | ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
    `;

    await fs.writeFile(filePath, html, 'utf-8');
  }

  /**
   * 生成发现列表HTML
   */
  private generateFindingsHTML(findings: any[]): string {
    if (findings.length === 0) {
      return '<p>No findings.</p>';
    }

    return findings.map(finding => `
      <div class="finding">
        <div class="finding-title">
          <span class="finding-severity severity-${finding.severity}">${finding.severity.toUpperCase()}</span>
          ${finding.title || finding.type}
        </div>
        <p>${finding.description || ''}</p>
        ${finding.location ? `<p><small>Location: Line ${finding.location.line}</small></p>` : ''}
        ${finding.snippet ? `<pre><code>${this.escapeHTML(finding.snippet)}</code></pre>` : ''}
      </div>
    `).join('');
  }

  /**
   * 导出为Markdown
   */
  private async exportMarkdown(filePath: string, data: any): Promise<void> {
    const md = `# JS Hunter Analysis Report

## Summary

- **Total Files**: ${data.files?.length || 0}
- **Total Findings**: ${data.totalFindings || 0}
- **Critical**: ${data.criticalCount || 0}
- **High**: ${data.highCount || 0}
- **Medium**: ${data.mediumCount || 0}
- **Low**: ${data.lowCount || 0}

## Analysis Results

${this.generateFindingsMarkdown(data.findings || [])}

---

*Generated by JS Hunter Desktop v1.0.0 | ${new Date().toLocaleString()}*
    `;

    await fs.writeFile(filePath, md, 'utf-8');
  }

  /**
   * 生成发现列表Markdown
   */
  private generateFindingsMarkdown(findings: any[]): string {
    if (findings.length === 0) {
      return 'No findings.';
    }

    return findings.map((finding, index) => `
### ${index + 1}. ${finding.title || finding.type}

**Severity**: ${finding.severity.toUpperCase()}

${finding.description || ''}

${finding.location ? `**Location**: Line ${finding.location.line}` : ''}

${finding.snippet ? `\`\`\`javascript\n${finding.snippet}\n\`\`\`` : ''}
    `).join('\n\n');
  }

  /**
   * 转义HTML
   */
  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
