// JS Hunter Desktop - Analysis Configuration Page
import React, { useState, useEffect } from 'react';
import '../styles/AnalysisConfig.css';

interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

const AnalysisConfig: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [templates, setTemplates] = useState<AnalysisTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const filesResult = await window.electronAPI.getFiles();
      const templatesResult = await window.electronAPI.getTemplates();
      setFiles(filesResult);
      setTemplates(templatesResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
    }
  };

  const handleToggleFile = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const handleStartAnalysis = async () => {
    if (selectedFiles.length === 0) {
      alert('请选择要分析的文件');
      return;
    }

    if (!selectedTemplate) {
      alert('请选择分析场景');
      return;
    }

    setAnalyzing(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileId = selectedFiles[i];
        await window.electronAPI.analyzeFile(fileId, {
          templateId: selectedTemplate,
        });
        setProgress(((i + 1) / selectedFiles.length) * 100);
      }

      alert('分析完成！');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('分析失败：' + (error as Error).message);
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="analysis-config">
      <header className="page-header">
        <h2>分析配置</h2>
      </header>

      <div className="config-section">
        <h3>1. 选择文件</h3>
        <div className="file-selection">
          <div className="selection-header">
            <label>
              <input
                type="checkbox"
                checked={selectedFiles.length === files.length && files.length > 0}
                onChange={handleSelectAll}
              />
              <span>全选 ({selectedFiles.length}/{files.length})</span>
            </label>
          </div>
          <div className="file-list-compact">
            {files.map((file) => (
              <label key={file.id} className="file-item">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleToggleFile(file.id)}
                />
                <span className="file-name">{file.url.split('/').pop()}</span>
                <span className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="config-section">
        <h3>2. 选择分析场景</h3>
        <div className="template-selection">
          {templates.map((template) => (
            <label
              key={template.id}
              className={`template-card ${
                selectedTemplate === template.id ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="template"
                value={template.id}
                checked={selectedTemplate === template.id}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              />
              <div className="template-content">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="config-section">
        <h3>3. 开始分析</h3>
        <button
          className="btn btn-primary btn-large"
          onClick={handleStartAnalysis}
          disabled={analyzing || selectedFiles.length === 0 || !selectedTemplate}
        >
          {analyzing ? '分析中...' : '开始分析'}
        </button>

        {analyzing && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisConfig;
