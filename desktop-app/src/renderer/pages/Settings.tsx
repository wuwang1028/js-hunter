// JS Hunter Desktop - Settings Page
import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

interface Config {
  aiProvider: 'gemini' | 'deepseek' | 'openai' | 'custom';
  apiKey: string;
  apiUrl?: string;
  maxTokens: number;
  temperature: number;
  concurrency: number;
  chunkSize: number;
}

const Settings: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    aiProvider: 'gemini',
    apiKey: '',
    apiUrl: '',
    maxTokens: 4096,
    temperature: 0.7,
    concurrency: 2,
    chunkSize: 8000,
  });
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await window.electronAPI.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.electronAPI.saveConfig(config);
      alert('设置已保存！');
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await window.electronAPI.testAIConnection(config);
      if (result.success) {
        alert('连接成功！');
      } else {
        alert('连接失败：' + result.error);
      }
    } catch (error) {
      alert('连接失败：' + (error as Error).message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleChange = (field: keyof Config, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const providerInfo = {
    gemini: {
      name: 'Google Gemini 2.5 Flash',
      context: '2M tokens',
      url: 'https://aistudio.google.com/apikey',
    },
    deepseek: {
      name: 'DeepSeek V3',
      context: '128K tokens',
      url: 'https://platform.deepseek.com/',
    },
    openai: {
      name: 'OpenAI GPT-4.1 Mini',
      context: '1M tokens',
      url: 'https://platform.openai.com/api-keys',
    },
    custom: {
      name: '自定义API',
      context: '自定义',
      url: '',
    },
  };

  return (
    <div className="settings">
      <header className="page-header">
        <h2>设置</h2>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h3>AI 配置</h3>

          <div className="form-group">
            <label>AI 提供商</label>
            <select
              className="form-control"
              value={config.aiProvider}
              onChange={(e) => handleChange('aiProvider', e.target.value)}
            >
              <option value="gemini">Google Gemini 2.5 Flash (推荐)</option>
              <option value="deepseek">DeepSeek V3</option>
              <option value="openai">OpenAI GPT-4.1 Mini</option>
              <option value="custom">自定义API</option>
            </select>
            <p className="form-help">
              {providerInfo[config.aiProvider].name} - 上下文: {providerInfo[config.aiProvider].context}
            </p>
          </div>

          <div className="form-group">
            <label>API 密钥</label>
            <input
              type="password"
              className="form-control"
              value={config.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="输入API密钥"
            />
            {providerInfo[config.aiProvider].url && (
              <p className="form-help">
                获取API密钥：
                <a href={providerInfo[config.aiProvider].url} target="_blank" rel="noopener noreferrer">
                  {providerInfo[config.aiProvider].url}
                </a>
              </p>
            )}
          </div>

          {config.aiProvider === 'custom' && (
            <div className="form-group">
              <label>API URL</label>
              <input
                type="text"
                className="form-control"
                value={config.apiUrl}
                onChange={(e) => handleChange('apiUrl', e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
          )}

          <button
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={testingConnection || !config.apiKey}
          >
            {testingConnection ? '测试中...' : '测试连接'}
          </button>
        </section>

        <section className="settings-section">
          <h3>分析参数</h3>

          <div className="form-group">
            <label>最大Token数</label>
            <input
              type="number"
              className="form-control"
              value={config.maxTokens}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              min="1024"
              max="32768"
            />
            <p className="form-help">每次请求的最大Token数（1024-32768）</p>
          </div>

          <div className="form-group">
            <label>Temperature</label>
            <input
              type="number"
              className="form-control"
              value={config.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              min="0"
              max="2"
              step="0.1"
            />
            <p className="form-help">控制输出的随机性（0-2，推荐0.7）</p>
          </div>

          <div className="form-group">
            <label>并发数</label>
            <input
              type="number"
              className="form-control"
              value={config.concurrency}
              onChange={(e) => handleChange('concurrency', parseInt(e.target.value))}
              min="1"
              max="10"
            />
            <p className="form-help">同时分析的文件数（1-10）</p>
          </div>

          <div className="form-group">
            <label>分块大小</label>
            <input
              type="number"
              className="form-control"
              value={config.chunkSize}
              onChange={(e) => handleChange('chunkSize', parseInt(e.target.value))}
              min="1000"
              max="50000"
              step="1000"
            />
            <p className="form-help">大文件分块的字符数（1000-50000）</p>
          </div>
        </section>

        <div className="settings-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
