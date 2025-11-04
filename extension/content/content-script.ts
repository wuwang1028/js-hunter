// JS Hunter - Content Script

import type { Message, MessageResponse } from '../types/index';

console.log('JS Hunter Content Script loaded');

/**
 * 收集页面中的内联JS
 */
function collectInlineJS(): void {
  const scriptTags = document.querySelectorAll('script:not([src])');

  scriptTags.forEach((script, index) => {
    const content = script.textContent || script.innerHTML;

    if (content.trim()) {
      sendMessage({
        type: 'COLLECT_JS',
        payload: {
          url: `${window.location.href}#inline-${index}`,
          content,
          type: 'inline',
        },
      });
    }
  });
}

/**
 * 收集页面中的外部JS
 */
function collectExternalJS(): void {
  const scriptTags = document.querySelectorAll('script[src]');

  scriptTags.forEach((script) => {
    const src = script.getAttribute('src');
    if (src) {
      const absoluteUrl = new URL(src, window.location.href).href;

      // 外部JS通过webRequest拦截，这里只记录URL
      console.log('External JS found:', absoluteUrl);
    }
  });
}

/**
 * 监听动态插入的script标签
 */
function observeDynamicScripts(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const script = node as HTMLScriptElement;

          if (script.src) {
            // 外部JS
            const absoluteUrl = new URL(script.src, window.location.href).href;
            console.log('Dynamic external JS found:', absoluteUrl);
          } else {
            // 内联JS
            const content = script.textContent || script.innerHTML;
            if (content.trim()) {
              sendMessage({
                type: 'COLLECT_JS',
                payload: {
                  url: `${window.location.href}#dynamic-${Date.now()}`,
                  content,
                  type: 'dynamic',
                },
              });
            }
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * 注入脚本以捕获eval和动态代码执行
 */
function injectInterceptor(): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/injected.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

/**
 * 监听来自injected script的消息
 */
window.addEventListener('message', (event) => {
  // 只接受来自同一窗口的消息
  if (event.source !== window) return;

  if (event.data.type === 'JS_HUNTER_EVAL_DETECTED') {
    const { code, stack } = event.data.payload;

    sendMessage({
      type: 'COLLECT_JS',
      payload: {
        url: `${window.location.href}#eval-${Date.now()}`,
        content: code,
        type: 'dynamic',
      },
    });

    console.log('Eval detected:', { code: code.substring(0, 100), stack });
  }
});

/**
 * 发送消息到background
 */
function sendMessage(message: Message): Promise<MessageResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * 初始化
 */
function init(): void {
  // 页面加载完成后收集JS
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      collectInlineJS();
      collectExternalJS();
    });
  } else {
    collectInlineJS();
    collectExternalJS();
  }

  // 监听动态JS
  observeDynamicScripts();

  // 注入拦截器
  injectInterceptor();
}

// 启动
init();

/**
 * 监听来自popup/devtools的消息
 */
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    if (message.type === 'COLLECT_JS') {
      // 手动触发收集
      collectInlineJS();
      collectExternalJS();
      sendResponse({ success: true });
    }

    return true;
  }
);
