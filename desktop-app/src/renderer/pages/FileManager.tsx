// JS Hunter Desktop - File Manager Page
import React, { useState, useEffect } from 'react';
import '../styles/FileManager.css';

interface FileManagerProps {
  onSelectFile: (fileId: string) => void;
}

interface JSFile {
  id: string;
  url: string;
  content: string;
  size: number;
  hash: string;
  collectedAt: number;
  metadata: {
    isMinified: boolean;
    isObfuscated: boolean;
    framework?: string;
  };
}

const FileManager: React.FC<FileManagerProps> = ({ onSelectFile }) => {
  const [files, setFiles] = useState<JSFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'minified' | 'obfuscated'>('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getFiles();
      setFiles(result);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async () => {
    try {
      const result = await window.electronAPI.importFile();
      if (result.success) {
        await loadFiles();
      }
    } catch (error) {
      console.error('Failed to import file:', error);
    }
  };

  const handleImportFolder = async () => {
    try {
      const result = await window.electronAPI.importFolder();
      if (result.success) {
        await loadFiles();
      }
    } catch (error) {
      console.error('Failed to import folder:', error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('确定要删除这个文件吗？')) {
      try {
        await window.electronAPI.deleteFile(fileId);
        await loadFiles();
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'minified' && file.metadata.isMinified) ||
      (filterType === 'obfuscated' && file.metadata.isObfuscated);
    return matchesSearch && matchesFilter;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="file-manager">
      <header className="page-header">
        <h2>文件管理</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleImportFile}>
            📄 导入文件
          </button>
          <button className="btn btn-primary" onClick={handleImportFolder}>
            📁 导入文件夹
          </button>
        </div>
      </header>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索文件..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="all">全部文件</option>
          <option value="minified">压缩文件</option>
          <option value="obfuscated">混淆文件</option>
        </select>
        <button className="btn btn-secondary" onClick={loadFiles}>
          🔄 刷新
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="file-list">
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              <p>📂 没有文件</p>
              <p>点击上方按钮导入JS文件</p>
            </div>
          ) : (
            <table className="file-table">
              <thead>
                <tr>
                  <th>文件名</th>
                  <th>大小</th>
                  <th>类型</th>
                  <th>框架</th>
                  <th>导入时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id} onClick={() => onSelectFile(file.id)}>
                    <td className="file-name" title={file.url}>
                      {file.url.split('/').pop() || file.url}
                    </td>
                    <td>{formatSize(file.size)}</td>
                    <td>
                      {file.metadata.isMinified && <span className="badge badge-warning">压缩</span>}
                      {file.metadata.isObfuscated && <span className="badge badge-danger">混淆</span>}
                      {!file.metadata.isMinified && !file.metadata.isObfuscated && (
                        <span className="badge badge-success">正常</span>
                      )}
                    </td>
                    <td>{file.metadata.framework || '-'}</td>
                    <td>{formatDate(file.collectedAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="stats">
        <p>共 {filteredFiles.length} 个文件</p>
      </div>
    </div>
  );
};

export default FileManager;
