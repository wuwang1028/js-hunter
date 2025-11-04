// JS Hunter - DevTools Script

// 创建DevTools面板
chrome.devtools.panels.create(
  'JS Hunter',
  'icons/icon48.png',
  'devtools/panel.html',
  (panel) => {
    console.log('JS Hunter DevTools panel created');
  }
);
