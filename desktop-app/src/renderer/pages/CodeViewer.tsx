// JS Hunter Desktop - Code Viewer Page
import React, { useState, useEffect } from 'react';
import '../styles/CodeViewer.css';

interface CodeViewerProps {
  fileId: string | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ fileId }) => {
  const [code, setCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);

  useEffect(() => {
    if (fileId) {
      loadCode(fileId);
    }
  }, [fileId]);

  const loadCode = async (id: string) => {
    setLoading(true);
    try {
      const file = await window.electronAPI.getFile(id);
      setCode(file.content);
      setFileName(file.url.split('/').pop() || file.url);
    } catch (error) {
      console.error('Failed to load code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('代码已复制到剪贴板');
  };

  const handleSaveCode = async () => {
    try {
      await window.electronAPI.saveCodeToFile(code, fileName);
      alert('保存成功！');
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存失败');
    }
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const renderCodeLines = () => {
    const lines = code.split('\n');
    
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const highlightedLine = highlightSearchTerm(line);
      
      return (
        <div key={lineNumber} className="code-line">
          {lineNumbers && (
            <span className="line-number">{lineNumber}</span>
          )}
          <span
            className="line-content"
            dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
          />
        </div>
      );
    });
  };

  if (!fileId) {
    return (
      <div className="code-viewer">
        <div className="empty-state">
          <p>💻 请从文件管理中选择一个文件查看代码</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-viewer">
      <header className="page-header">
        <h2>代码查看器</h2>
        <div className="header-info">
          <span className="file-name">{fileName}</span>
        </div>
      </header>

      <div className="code-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索代码..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label className="toolbar-option">
          <input
            type="checkbox"
            checked={lineNumbers}
            onChange={(e) => setLineNumbers(e.target.checked)}
          />
          <span>显示行号</span>
        </label>
        <label className="toolbar-option">
          <input
            type="checkbox"
            checked={wrapLines}
            onChange={(e) => setWrapLines(e.target.checked)}
          />
          <span>自动换行</span>
        </label>
        <button className="btn btn-secondary" onClick={handleCopyCode}>
          📋 复制代码
        </button>
        <button className="btn btn-secondary" onClick={handleSaveCode}>
          💾 保存文件
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className={`code-container ${wrapLines ? 'wrap-lines' : ''}`}>
          <pre className="code-block">
            {renderCodeLines()}
          </pre>
        </div>
      )}

      <div className="code-stats">
        <span>总行数: {code.split('\n').length}</span>
        <span>字符数: {code.length}</span>
        <span>大小: {(new Blob([code]).size / 1024).toFixed(2)} KB</span>
      </div>
    </div>
  );
};

export default CodeViewer;
