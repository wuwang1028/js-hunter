/**
 * Content Script - 在网页上下文中运行
 * 负责收集内联JS、注入脚本、监听动态加载
 */

console.log('[JS Hunter] Content script loaded');

// 1. 收集内联JS代码
function collectInlineScripts() {
  const scripts = document.querySelectorAll('script:not([src])');
  const inlineScripts = [];
  
  scripts.forEach((script, index) => {
    if (script.textContent.trim()) {
      inlineScripts.push({
        type: 'inline',
        index: index,
        content: script.textContent,
        size: script.textContent.length,
        hash: hashCode(script.textContent)
      });
    }
  });
  
  return inlineScripts;
}

// 2. 收集外部JS文件
function collectExternalScripts() {
  const scripts = document.querySelectorAll('script[src]');
  const externalScripts = [];
  
  scripts.forEach((script) => {
    const src = script.src;
    if (src) {
      externalScripts.push({
        type: 'external',
        src: src,
        async: script.async,
        defer: script.defer
      });
    }
  });
  
  return externalScripts;
}

// 3. 注入脚本以捕获eval和Function
function injectMonitoringScript() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      const originalEval = window.eval;
      const originalFunction = window.Function;
      const capturedCode = [];
      
      // 拦截eval
      window.eval = function(code) {
        capturedCode.push({
          type: 'eval',
          code: code,
          timestamp: Date.now()
        });
        window.postMessage({
          type: 'JS_HUNTER_EVAL',
          code: code
        }, '*');
        return originalEval.call(this, code);
      };
      
      // 拦截Function构造器
      window.Function = function(...args) {
        const code = args[args.length - 1];
        capturedCode.push({
          type: 'Function',
          code: code,
          timestamp: Date.now()
        });
        window.postMessage({
          type: 'JS_HUNTER_FUNCTION',
          code: code
        }, '*');
        return originalFunction.apply(this, args);
      };
      
      // 拦截setTimeout/setInterval
      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;
      
      window.setTimeout = function(code, delay) {
        if (typeof code === 'string') {
          window.postMessage({
            type: 'JS_HUNTER_TIMEOUT',
            code: code
          }, '*');
        }
        return originalSetTimeout.apply(this, arguments);
      };
      
      window.setInterval = function(code, delay) {
        if (typeof code === 'string') {
          window.postMessage({
            type: 'JS_HUNTER_INTERVAL',
            code: code
          }, '*');
        }
        return originalSetInterval.apply(this, arguments);
      };
    })();
  `;
  
  (document.head || document.documentElement).appendChild(script);
}

// 4. 监听动态加载的脚本
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            if (node.src) {
              // 新增外部脚本
              window.postMessage({
                type: 'JS_HUNTER_NEW_EXTERNAL',
                src: node.src
              }, '*');
            } else if (node.textContent) {
              // 新增内联脚本
              window.postMessage({
                type: 'JS_HUNTER_NEW_INLINE',
                content: node.textContent
              }, '*');
            }
          }
        });
      }
    });
  });
  
  observer.observe(document, {
    childList: true,
    subtree: true
  });
}

// 5. 监听来自injected脚本的消息
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  const { type, code, src } = event.data;
  
  if (type && type.startsWith('JS_HUNTER_')) {
    // 转发给background script
    chrome.runtime.sendMessage({
      action: 'capturedCode',
      data: event.data
    }).catch(err => {
      // 忽略错误（后台脚本可能未就绪）
    });
  }
});

// 6. 简单的哈希函数
function hashCode(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// 初始化
function init() {
  try {
    // 收集现有脚本
    const inline = collectInlineScripts();
    const external = collectExternalScripts();
    
    // 发送给background script
    chrome.runtime.sendMessage({
      action: 'collectScripts',
      data: {
        inline: inline,
        external: external,
        url: window.location.href
      }
    }).catch(err => {
      console.log('[JS Hunter] Failed to send message to background:', err);
    });
    
    // 注入监控脚本
    injectMonitoringScript();
    
    // 设置MutationObserver
    setupMutationObserver();
    
    console.log('[JS Hunter] Initialization complete');
  } catch (error) {
    console.error('[JS Hunter] Error during initialization:', error);
  }
}

// 等待DOM就绪
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
