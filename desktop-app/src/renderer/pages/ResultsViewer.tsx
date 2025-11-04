// JS Hunter Desktop - Results Viewer Page
import React, { useState, useEffect } from 'react';
import '../styles/ResultsViewer.css';

interface AnalysisResult {
  id: string;
  fileId: string;
  fileName: string;
  templateName: string;
  findings: any[];
  analyzedAt: number;
  summary: string;
}

const ResultsViewer: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await window.electronAPI.getResults();
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (resultId: string, format: 'json' | 'html' | 'md') => {
    try {
      await window.electronAPI.exportResult(resultId, format);
      alert('导出成功！');
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败');
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (confirm('确定要删除这个分析结果吗？')) {
      try {
        await window.electronAPI.deleteResult(resultId);
        await loadResults();
        if (selectedResult?.id === resultId) {
          setSelectedResult(null);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'badge-critical',
      high: 'badge-danger',
      medium: 'badge-warning',
      low: 'badge-info',
    };
    return colors[severity] || 'badge-secondary';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="results-viewer">
      <header className="page-header">
        <h2>分析结果</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadResults}>
            🔄 刷新
          </button>
        </div>
      </header>

      <div className="results-container">
        <aside className="results-sidebar">
          <div className="sidebar-toolbar">
            <select
              className="filter-select"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="results-list">
            {loading ? (
              <div className="loading">加载中...</div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <p>📊 暂无分析结果</p>
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className={`result-item ${
                    selectedResult?.id === result.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="result-header">
                    <h4>{result.fileName}</h4>
                    <span className="result-date">
                      {formatDate(result.analyzedAt)}
                    </span>
                  </div>
                  <div className="result-meta">
                    <span className="template-name">{result.templateName}</span>
                    <span className="findings-count">
                      {result.findings.length} 个发现
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="results-main">
          {selectedResult ? (
            <div className="result-detail">
              <div className="detail-header">
                <div>
                  <h3>{selectedResult.fileName}</h3>
                  <p className="detail-meta">
                    {selectedResult.templateName} · {formatDate(selectedResult.analyzedAt)}
                  </p>
                </div>
                <div className="detail-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleExport(selectedResult.id, 'json')}
                  >
                    导出JSON
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleExport(selectedResult.id, 'html')}
                  >
                    导出HTML
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleExport(selectedResult.id, 'md')}
                  >
                    导出MD
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteResult(selectedResult.id)}
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="detail-summary">
                <h4>摘要</h4>
                <p>{selectedResult.summary}</p>
              </div>

              <div className="detail-findings">
                <h4>发现 ({selectedResult.findings.length})</h4>
                {selectedResult.findings.map((finding, index) => (
                  <div key={index} className="finding-card">
                    <div className="finding-header">
                      <h5>{finding.title || `发现 #${index + 1}`}</h5>
                      {finding.severity && (
                        <span className={`badge ${getSeverityBadge(finding.severity)}`}>
                          {finding.severity.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="finding-description">{finding.description}</p>
                    {finding.code && (
                      <pre className="finding-code">
                        <code>{finding.code}</code>
                      </pre>
                    )}
                    {finding.recommendation && (
                      <div className="finding-recommendation">
                        <strong>建议：</strong>
                        <p>{finding.recommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-detail">
              <p>👈 选择一个分析结果查看详情</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResultsViewer;
