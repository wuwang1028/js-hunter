// JS Hunter - Popup Script

// 状态
let currentTab = null;
let jsFiles = [];
let analysisResults = [];

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await init();
  setupEventListeners();
});

/**
 * 初始化
 */
async function init() {
  try {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // 显示页面URL
    const pageUrl = document.getElementById('pageUrl');
    if (pageUrl) {
      pageUrl.textContent = new URL(tab.url).hostname;
    }

    // 加载数据
    await loadData();
  } catch (error) {
    console.error('Init error:', error);
  }
}

/**
 * 加载数据
 */
async function loadData() {
  try {
    // 获取当前域名的JS文件
    const domain = new URL(currentTab.url).hostname;

    const response = await sendMessage({
      type: 'GET_FILES',
      payload: { domain },
    });

    if (response.success) {
      jsFiles = response.data || [];
      updateStats();
      updateFindingsList();
    }
  } catch (error) {
    console.error('Load data error:', error);
  }
}

/**
 * 更新统计信息
 */
function updateStats() {
  const jsCount = document.getElementById('jsCount');
  const analyzedCount = document.getElementById('analyzedCount');
  const findingsCount = document.getElementById('findingsCount');

  if (jsCount) {
    jsCount.textContent = jsFiles.length;
  }

  // TODO: 计算已分析的文件数
  if (analyzedCount) {
    analyzedCount.textContent = '0';
  }

  // TODO: 计算发现的问题数
  if (findingsCount) {
    findingsCount.textContent = '0';
  }
}

/**
 * 更新发现列表
 */
function updateFindingsList() {
  const findingsList = document.getElementById('findingsList');
  if (!findingsList) return;

  // TODO: 显示实际的发现
  // 现在显示空状态
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 收集JS按钮
  const collectBtn = document.getElementById('collectBtn');
  if (collectBtn) {
    collectBtn.addEventListener('click', handleCollect);
  }

  // 分析按钮
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyze);
  }

  // 查看结果按钮
  const viewResultsBtn = document.getElementById('viewResultsBtn');
  if (viewResultsBtn) {
    viewResultsBtn.addEventListener('click', handleViewResults);
  }

  // 导出按钮
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
  }

  // 设置按钮
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', handleSettings);
  }

  // 打开DevTools按钮
  const openDevToolsBtn = document.getElementById('openDevToolsBtn');
  if (openDevToolsBtn) {
    openDevToolsBtn.addEventListener('click', handleOpenDevTools);
  }

  // 查看全部按钮
  const viewAllBtn = document.getElementById('viewAllBtn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', handleViewResults);
  }
}

/**
 * 处理收集JS
 */
async function handleCollect() {
  const collectBtn = document.getElementById('collectBtn');
  if (!collectBtn) return;

  try {
    collectBtn.disabled = true;
    collectBtn.innerHTML = '<span class="loading"></span> 收集中...';

    // 发送消息到content script
    await chrome.tabs.sendMessage(currentTab.id, {
      type: 'COLLECT_JS',
    });

    // 等待一下让收集完成
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 重新加载数据
    await loadData();

    // 显示成功消息
    showNotification('JS文件收集完成！', 'success');
  } catch (error) {
    console.error('Collect error:', error);
    showNotification('收集失败: ' + error.message, 'error');
  } finally {
    collectBtn.disabled = false;
    collectBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      收集所有JS
    `;
  }
}

/**
 * 处理分析
 */
async function handleAnalyze() {
  if (jsFiles.length === 0) {
    showNotification('请先收集JS文件', 'warning');
    return;
  }

  const analyzeBtn = document.getElementById('analyzeBtn');
  if (!analyzeBtn) return;

  try {
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="loading"></span> 分析中...';

    // TODO: 实现分析逻辑
    showNotification('分析功能开发中...', 'info');
  } catch (error) {
    console.error('Analyze error:', error);
    showNotification('分析失败: ' + error.message, 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      开始分析
    `;
  }
}

/**
 * 处理查看结果
 */
function handleViewResults() {
  // 打开DevTools面板
  handleOpenDevTools();
}

/**
 * 处理导出
 */
function handleExport() {
  showNotification('导出功能开发中...', 'info');
}

/**
 * 处理设置
 */
function handleSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * 处理打开DevTools
 */
function handleOpenDevTools() {
  // Chrome扩展无法直接打开DevTools面板
  // 提示用户手动打开
  showNotification('请按F12打开开发者工具，然后切换到"JS Hunter"标签', 'info');
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
 * 显示通知
 */
function showNotification(message, type = 'info') {
  // 简单的通知实现
  console.log(`[${type.toUpperCase()}] ${message}`);

  // TODO: 实现更好的通知UI
  alert(message);
}

/**
 * 监听来自background的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'JS_COLLECTED') {
    // JS文件收集完成，重新加载数据
    loadData();
  } else if (message.type === 'ANALYSIS_COMPLETE') {
    // 分析完成，重新加载数据
    loadData();
  }

  sendResponse({ success: true });
  return true;
});
