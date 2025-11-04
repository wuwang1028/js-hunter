// JS Hunter - DevTools Panel Script

let jsFiles = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadFiles();
  setupEventListeners();
});

/**
 * 加载文件列表
 */
async function loadFiles() {
  try {
    const tabId = chrome.devtools.inspectedWindow.tabId;

    // 获取当前标签页的URL
    chrome.tabs.get(tabId, async (tab) => {
      const domain = new URL(tab.url).hostname;

      const response = await sendMessage({
        type: 'GET_FILES',
        payload: { domain },
      });

      if (response.success) {
        jsFiles = response.data || [];
        renderFileList();
        updateStats();
      }
    });
  } catch (error) {
    console.error('Load files error:', error);
  }
}

/**
 * 渲染文件列表
 */
function renderFileList() {
  const fileList = document.getElementById('fileList');
  const emptyState = document.getElementById('emptyState');

  if (jsFiles.length === 0) {
    fileList.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  fileList.innerHTML = jsFiles
    .map(
      (file) => `
        <div class="file-item" data-id="${file.id}">
          <div class="file-url" title="${file.url}">${file.url}</div>
          <div class="file-meta">
            <span>大小: ${formatFileSize(file.size)}</span>
            <span>类型: ${file.type}</span>
            <span>时间: ${formatTime(file.timestamp)}</span>
            ${file.metadata.isMinified ? '<span>已压缩</span>' : ''}
            ${file.metadata.isObfuscated ? '<span>已混淆</span>' : ''}
          </div>
        </div>
      `
    )
    .join('');

  // 添加点击事件
  fileList.querySelectorAll('.file-item').forEach((item) => {
    item.addEventListener('click', () => {
      const fileId = item.dataset.id;
      showFileDetails(fileId);
    });
  });
}

/**
 * 更新统计信息
 */
function updateStats() {
  const statsText = document.getElementById('statsText');
  if (statsText) {
    statsText.textContent = `共 ${jsFiles.length} 个JS文件`;
  }
}

/**
 * 显示文件详情
 */
function showFileDetails(fileId) {
  const file = jsFiles.find((f) => f.id === fileId);
  if (!file) return;

  // TODO: 实现详情面板
  console.log('File details:', file);
  alert('文件详情功能开发中...');
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 收集按钮
  document.getElementById('collectBtn').addEventListener('click', async () => {
    try {
      const tabId = chrome.devtools.inspectedWindow.tabId;

      // 发送消息到content script
      chrome.tabs.sendMessage(tabId, { type: 'COLLECT_JS' });

      // 等待一下
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 重新加载
      loadFiles();
    } catch (error) {
      console.error('Collect error:', error);
    }
  });

  // 刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadFiles();
  });

  // 清空按钮
  document.getElementById('clearBtn').addEventListener('click', async () => {
    if (!confirm('确定要清空所有数据吗？')) {
      return;
    }

    try {
      await sendMessage({ type: 'CLEAR_DATA' });
      loadFiles();
    } catch (error) {
      console.error('Clear error:', error);
    }
  });
}

/**
 * 发送消息到background
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  return Math.floor(diff / 86400000) + '天前';
}

/**
 * 监听来自background的消息
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'JS_COLLECTED') {
    loadFiles();
  }
});


// ==================== 导出功能 ====================

/**
 * 导出分析结果
 */
async function exportResults(format) {
  try {
    const response = await sendMessage({
      type: 'GET_ALL_RESULTS',
      payload: {},
    });

    if (!response.success || !response.data || response.data.length === 0) {
      alert('没有可导出的分析结果');
      return;
    }

    const results = response.data;
    let content = '';
    let filename = `js-hunter-report-${Date.now()}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'json':
        content = JSON.stringify(results, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;

      case 'html':
        content = generateHTMLReport(results);
        filename += '.html';
        mimeType = 'text/html';
        break;

      case 'markdown':
        content = generateMarkdownReport(results);
        filename += '.md';
        mimeType = 'text/markdown';
        break;

      case 'csv':
        content = generateCSVReport(results);
        filename += '.csv';
        mimeType = 'text/csv';
        break;

      default:
        alert('不支持的导出格式');
        return;
    }

    // 下载文件
    downloadFile(content, filename, mimeType);
    showNotification('导出成功', `已导出为 ${filename}`);
  } catch (error) {
    console.error('Export error:', error);
    alert('导出失败: ' + error.message);
  }
}

/**
 * 生成HTML报告
 */
function generateHTMLReport(results) {
  const totalFindings = results.reduce((sum, r) => sum + (r.findings?.length || 0), 0);
  
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JS Hunter 综合分析报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; padding: 1.5rem 2rem; background: #f3f4f6; }
    .stat-item { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 0.875rem; color: #6b7280; text-transform: uppercase; }
    .content { padding: 2rem; }
    .result-section { margin-bottom: 2rem; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .result-header { background: #f9fafb; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
    .result-header h2 { font-size: 1.25rem; color: #1f2937; }
    .finding { padding: 1rem; border-bottom: 1px solid #e5e7eb; }
    .finding:last-child { border-bottom: none; }
    .finding-title { font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white; text-transform: uppercase; }
    .badge.critical { background: #dc2626; }
    .badge.high { background: #ea580c; }
    .badge.medium { background: #f59e0b; }
    .badge.low { background: #3b82f6; }
    .badge.info { background: #6b7280; }
    .code-block { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 4px; overflow-x: auto; margin: 0.5rem 0; }
    .code-block code { font-family: 'Monaco', 'Menlo', monospace; font-size: 0.875rem; }
    .footer { background: #f9fafb; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 JS Hunter 综合分析报告</h1>
      <p>JavaScript 安全分析工具 - 渗透测试专用</p>
    </div>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">${results.length}</div>
        <div class="stat-label">分析文件</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${totalFindings}</div>
        <div class="stat-label">发现总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${new Date().toLocaleDateString('zh-CN')}</div>
        <div class="stat-label">生成日期</div>
      </div>
    </div>
    <div class="content">`;

  results.forEach((result, index) => {
    const findings = result.findings || [];
    html += `
      <div class="result-section">
        <div class="result-header">
          <h2>${index + 1}. ${escapeHtml(result.fileName || '未知文件')}</h2>
          <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
            分析时间: ${new Date(result.analyzedAt).toLocaleString('zh-CN')} | 
            发现: ${findings.length} 项
          </p>
        </div>`;

    if (findings.length === 0) {
      html += `<div class="finding"><p style="color: #6b7280;">✅ 未发现安全问题</p></div>`;
    } else {
      findings.forEach((finding) => {
        html += `
          <div class="finding">
            <div class="finding-title">
              ${escapeHtml(finding.title)}
              <span class="badge ${finding.severity}">${finding.severity}</span>
            </div>
            <p style="color: #4b5563; margin-bottom: 0.5rem;">${escapeHtml(finding.description)}</p>
            ${finding.code ? `<div class="code-block"><code>${escapeHtml(finding.code)}</code></div>` : ''}
            ${finding.recommendation ? `<p style="color: #059669; font-size: 0.875rem;"><strong>建议:</strong> ${escapeHtml(finding.recommendation)}</p>` : ''}
          </div>`;
      });
    }

    html += `</div>`;
  });

  html += `
    </div>
    <div class="footer">
      <p>生成时间: ${new Date().toLocaleString('zh-CN')} | JS Hunter v1.0.0</p>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * 生成Markdown报告
 */
function generateMarkdownReport(results) {
  let md = `# 🔍 JS Hunter 综合分析报告\n\n`;
  md += `**生成时间:** ${new Date().toLocaleString('zh-CN')}\n`;
  md += `**分析文件数:** ${results.length}\n`;
  md += `**发现总数:** ${results.reduce((sum, r) => sum + (r.findings?.length || 0), 0)}\n\n`;
  md += `---\n\n`;

  results.forEach((result, index) => {
    const findings = result.findings || [];
    md += `## ${index + 1}. ${result.fileName || '未知文件'}\n\n`;
    md += `**分析时间:** ${new Date(result.analyzedAt).toLocaleString('zh-CN')}\n`;
    md += `**发现数量:** ${findings.length}\n\n`;

    if (findings.length === 0) {
      md += `✅ 未发现安全问题\n\n`;
    } else {
      findings.forEach((finding, fIndex) => {
        md += `### ${index + 1}.${fIndex + 1} ${finding.title}\n\n`;
        md += `**严重程度:** ${finding.severity}\n\n`;
        md += `${finding.description}\n\n`;
        if (finding.code) {
          md += `\`\`\`javascript\n${finding.code}\n\`\`\`\n\n`;
        }
        if (finding.recommendation) {
          md += `**建议:** ${finding.recommendation}\n\n`;
        }
      });
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * 生成CSV报告
 */
function generateCSVReport(results) {
  const headers = ['文件名', '严重程度', '标题', '描述', '分析时间'];
  const rows = [headers.join(',')];

  results.forEach((result) => {
    const findings = result.findings || [];
    findings.forEach((finding) => {
      const row = [
        escapeCSV(result.fileName || ''),
        escapeCSV(finding.severity || ''),
        escapeCSV(finding.title || ''),
        escapeCSV(finding.description || ''),
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
function downloadFile(content, filename, mimeType) {
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
 * 工具函数
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeCSV(text) {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function showNotification(title, message) {
  // 简单的通知实现
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.innerHTML = `<strong>${title}</strong><br>${message}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// 添加导出按钮事件监听
function setupExportListeners() {
  const exportButtons = {
    exportJSON: 'json',
    exportHTML: 'html',
    exportMarkdown: 'markdown',
    exportCSV: 'csv',
  };

  Object.entries(exportButtons).forEach(([id, format]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => exportResults(format));
    }
  });
}

// 在DOMContentLoaded中调用
document.addEventListener('DOMContentLoaded', () => {
  setupExportListeners();
});
