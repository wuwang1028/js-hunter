/**
 * Service Worker - Background Script
 * 负责Web请求拦截、消息处理、存储管理
 */

console.log('[JS Hunter] Service Worker started');

// 存储收集到的JS文件
const collectedScripts = new Map();
const scriptHashes = new Set();

// 1. 拦截Web请求
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { url, type, tabId } = details;
    
    // 只关注脚本请求
    if (type === 'script' || url.endsWith('.js')) {
      handleScriptRequest(url, tabId);
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

// 2. 处理脚本请求
function handleScriptRequest(url, tabId) {
  // 过滤掉常见的CDN和库
  if (isIgnoredScript(url)) return;
  
  const hash = simpleHash(url);
  if (scriptHashes.has(hash)) return; // 已收集
  
  scriptHashes.add(hash);
  
  const script = {
    type: 'external',
    src: url,
    tabId: tabId,
    timestamp: Date.now(),
    hash: hash
  };
  
  collectedScripts.set(hash, script);
  
  // 通知所有标签页
  chrome.tabs.sendMessage(tabId, {
    action: 'newScriptDetected',
    script: script
  }).catch(() => {});
}

// 3. 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, data } = request;
  
  switch (action) {
    case 'collectScripts':
      handleCollectScripts(data, sender.tab.id);
      break;
      
    case 'capturedCode':
      handleCapturedCode(data, sender.tab.id);
      break;
      
    case 'getCollectedScripts':
      sendResponse({
        scripts: Array.from(collectedScripts.values())
      });
      break;
      
    case 'clearScripts':
      collectedScripts.clear();
      scriptHashes.clear();
      sendResponse({ success: true });
      break;
      
    case 'analyzeScript':
      analyzeScript(data);
      break;
      
    default:
      console.log('[JS Hunter] Unknown action:', action);
  }
  
  return true; // 保持消息通道打开
});

// 4. 处理收集的脚本
function handleCollectScripts(data, tabId) {
  const { inline, external, url } = data;
  
  // 存储内联脚本
  if (inline && Array.isArray(inline)) {
    inline.forEach((script, index) => {
      const hash = simpleHash(script.content);
      if (!scriptHashes.has(hash)) {
        scriptHashes.add(hash);
        collectedScripts.set(hash, {
          type: 'inline',
          content: script.content,
          tabId: tabId,
          pageUrl: url,
          timestamp: Date.now(),
          hash: hash
        });
      }
    });
  }
  
  // 存储外部脚本
  if (external && Array.isArray(external)) {
    external.forEach((script) => {
      const hash = simpleHash(script.src);
      if (!scriptHashes.has(hash) && !isIgnoredScript(script.src)) {
        scriptHashes.add(hash);
        collectedScripts.set(hash, {
          type: 'external',
          src: script.src,
          tabId: tabId,
          pageUrl: url,
          timestamp: Date.now(),
          hash: hash
        });
      }
    });
  }
  
  console.log('[JS Hunter] Collected scripts:', collectedScripts.size);
}

// 5. 处理捕获的代码
function handleCapturedCode(data, tabId) {
  const { type, code } = data;
  
  const hash = simpleHash(code);
  if (!scriptHashes.has(hash)) {
    scriptHashes.add(hash);
    collectedScripts.set(hash, {
      type: 'captured',
      captureType: type,
      content: code,
      tabId: tabId,
      timestamp: Date.now(),
      hash: hash
    });
  }
}

// 6. 分析脚本
function analyzeScript(data) {
  const { scriptHash, analysisType, aiProvider, apiKey } = data;
  
  const script = collectedScripts.get(scriptHash);
  if (!script) {
    console.error('[JS Hunter] Script not found:', scriptHash);
    return;
  }
  
  // 获取脚本内容
  const content = script.content || script.src;
  
  // 调用AI分析（这里是占位符，实际应该调用AI API）
  console.log('[JS Hunter] Analyzing script with', analysisType);
  
  // 存储分析结果
  chrome.storage.local.get('analysisResults', (result) => {
    const results = result.analysisResults || {};
    results[scriptHash] = {
      type: analysisType,
      status: 'analyzing',
      timestamp: Date.now()
    };
    chrome.storage.local.set({ analysisResults: results });
  });
}

// 7. 工具函数：检查是否忽略脚本
function isIgnoredScript(url) {
  const ignoredPatterns = [
    'chrome://',
    'chrome-extension://',
    'moz-extension://',
    'data:',
    'blob:',
    // 常见CDN
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'cdn.bootcdn.net',
    // 第三方服务
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com/en_US/sdk.js',
    'connect.facebook.net',
    'platform.twitter.com',
    'platform.linkedin.com'
  ];
  
  return ignoredPatterns.some(pattern => url.includes(pattern));
}

// 8. 简单的哈希函数
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// 9. 处理扩展安装/更新
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[JS Hunter] Extension installed');
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('[JS Hunter] Extension updated');
  }
});

// 10. 定期清理过期数据
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24小时
  
  for (const [hash, script] of collectedScripts.entries()) {
    if (now - script.timestamp > maxAge) {
      collectedScripts.delete(hash);
      scriptHashes.delete(hash);
    }
  }
}, 60 * 60 * 1000); // 每小时检查一次

console.log('[JS Hunter] Service Worker initialization complete');
