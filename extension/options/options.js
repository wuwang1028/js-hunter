// JS Hunter - Options Script

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupEventListeners();
});

/**
 * 加载配置
 */
async function loadConfig() {
  try {
    const response = await sendMessage({ type: 'GET_CONFIG' });

    if (response.success) {
      const config = response.data;

      // API配置
      document.getElementById('geminiKey').value = config.apiKeys.gemini || '';
      document.getElementById('deepseekKey').value = config.apiKeys.deepseek || '';
      document.getElementById('openaiKey').value = config.apiKeys.openai || '';
      document.getElementById('customEndpoint').value = config.customApiEndpoint || '';
      document.getElementById('customKey').value = config.apiKeys.custom || '';

      // 分析设置
      document.getElementById('defaultModel').value = config.analysis.defaultModel;
      document.getElementById('autoAnalyze').checked = config.analysis.autoAnalyze;

      // 默认分析场景
      const scenarios = config.analysis.defaultScenarios;
      document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach((checkbox) => {
        checkbox.checked = scenarios.includes(checkbox.value);
      });

      // 收集设置
      document.getElementById('autoCollect').checked = config.collection.autoCollect;
      document.getElementById('collectInline').checked = config.collection.collectInline;
      document.getElementById('collectDynamic').checked = config.collection.collectDynamic;
      document.getElementById('maxFileSize').value = config.collection.maxFileSize / (1024 * 1024);

      // 存储设置
      document.getElementById('maxStorage').value = config.storage.maxStorage / (1024 * 1024);
      document.getElementById('autoCleanup').checked = config.storage.autoCleanup;
      document.getElementById('retentionDays').value = config.storage.retentionDays;

      // UI设置
      document.getElementById('theme').value = config.ui.theme;
      document.getElementById('language').value = config.ui.language;
    }
  } catch (error) {
    console.error('Load config error:', error);
    showToast('加载配置失败', 'error');
  }
}

/**
 * 保存配置
 */
async function saveConfig() {
  try {
    // 收集表单数据
    const config = {
      apiKeys: {
        gemini: document.getElementById('geminiKey').value.trim(),
        deepseek: document.getElementById('deepseekKey').value.trim(),
        openai: document.getElementById('openaiKey').value.trim(),
        custom: document.getElementById('customKey').value.trim(),
      },
      customApiEndpoint: document.getElementById('customEndpoint').value.trim(),
      analysis: {
        defaultModel: document.getElementById('defaultModel').value,
        autoAnalyze: document.getElementById('autoAnalyze').checked,
        defaultScenarios: Array.from(
          document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')
        ).map((cb) => cb.value),
      },
      collection: {
        autoCollect: document.getElementById('autoCollect').checked,
        collectInline: document.getElementById('collectInline').checked,
        collectDynamic: document.getElementById('collectDynamic').checked,
        maxFileSize: parseInt(document.getElementById('maxFileSize').value) * 1024 * 1024,
      },
      storage: {
        maxStorage: parseInt(document.getElementById('maxStorage').value) * 1024 * 1024,
        autoCleanup: document.getElementById('autoCleanup').checked,
        retentionDays: parseInt(document.getElementById('retentionDays').value),
      },
      ui: {
        theme: document.getElementById('theme').value,
        language: document.getElementById('language').value,
      },
    };

    // 发送到background
    const response = await sendMessage({
      type: 'UPDATE_CONFIG',
      payload: config,
    });

    if (response.success) {
      showToast('设置已保存', 'success');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Save config error:', error);
    showToast('保存失败: ' + error.message, 'error');
  }
}

/**
 * 重置配置
 */
async function resetConfig() {
  if (!confirm('确定要重置所有设置吗？')) {
    return;
  }

  try {
    // 清空表单
    document.getElementById('geminiKey').value = '';
    document.getElementById('deepseekKey').value = '';
    document.getElementById('openaiKey').value = '';
    document.getElementById('customEndpoint').value = '';
    document.getElementById('customKey').value = '';

    document.getElementById('defaultModel').value = 'gemini-2.5-flash';
    document.getElementById('autoAnalyze').checked = false;

    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = ['api-discovery', 'secret-scan', 'vulnerability-scan'].includes(
        checkbox.value
      );
    });

    document.getElementById('autoCollect').checked = true;
    document.getElementById('collectInline').checked = true;
    document.getElementById('collectDynamic').checked = true;
    document.getElementById('maxFileSize').value = 10;

    document.getElementById('maxStorage').value = 1024;
    document.getElementById('autoCleanup').checked = true;
    document.getElementById('retentionDays').value = 30;

    document.getElementById('theme').value = 'dark';
    document.getElementById('language').value = 'zh';

    showToast('设置已重置', 'success');
  } catch (error) {
    console.error('Reset config error:', error);
    showToast('重置失败', 'error');
  }
}

/**
 * 清空数据
 */
async function clearData() {
  if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    return;
  }

  if (!confirm('再次确认：这将删除所有收集的JS文件和分析结果！')) {
    return;
  }

  try {
    const response = await sendMessage({ type: 'CLEAR_DATA' });

    if (response.success) {
      showToast('数据已清空', 'success');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Clear data error:', error);
    showToast('清空失败: ' + error.message, 'error');
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 保存按钮
  document.getElementById('saveBtn').addEventListener('click', saveConfig);

  // 重置按钮
  document.getElementById('resetBtn').addEventListener('click', resetConfig);

  // 清空数据按钮
  document.getElementById('clearDataBtn').addEventListener('click', clearData);
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
 * 显示Toast通知
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
